import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { ensureUserByEmail } from "@/lib/entitlements";
import { prisma } from "@/lib/db";
import { getRequiredEnv } from "@/lib/env";
import {
  createProjectMessage,
  listRecentProjectMessages,
} from "@/lib/messages-data";
import { validateMessageContent } from "@/lib/messages";
import { OpenAIChatMessage, postOpenAIChatCompletions } from "@/lib/openai";

const OPENAI_MODEL = "gpt-4o-mini";

function mapRole(role: "USER" | "ASSISTANT" | "SYSTEM"): OpenAIChatMessage["role"] {
  if (role === "USER") return "user";
  if (role === "ASSISTANT") return "assistant";
  return "system";
}

function buildSystemPrompt(): OpenAIChatMessage {
  return {
    role: "system",
    content:
      "You are a focused product requirements assistant. Ask concise follow-up questions and avoid implementation details.",
  };
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user?.email;
  if (!email) {
    console.warn("chat: missing email in session");
    return NextResponse.json(
      { error: "Unable to verify your account." },
      { status: 401 }
    );
  }

  const user = await ensureUserByEmail({
    email,
    name: session.user?.name,
    image: session.user?.image,
  });

  const project = await prisma.project.findFirst({
    where: { id: params.projectId, userId: user.id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const messageCheck = validateMessageContent(body.content ?? "");
  if (!messageCheck.ok) {
    return NextResponse.json({ error: messageCheck.error }, { status: 400 });
  }

  const apiKey = (() => {
    try {
      return getRequiredEnv("OPENAI_API_KEY");
    } catch (error) {
      console.error("chat: missing OPENAI_API_KEY", error);
      return null;
    }
  })();

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  console.info("chat: incoming message", { userId: user.id, projectId: project.id });

  await createProjectMessage({
    projectId: project.id,
    role: "USER",
    content: messageCheck.value,
  });

  const history = await listRecentProjectMessages({
    projectId: project.id,
    userId: user.id,
    limit: 24,
  });

  const openAiMessages: OpenAIChatMessage[] = [
    buildSystemPrompt(),
    ...history.map((message) => ({
      role: mapRole(message.role),
      content: message.content,
    })),
  ];

  const openAiRequest = await postOpenAIChatCompletions({
    apiKey,
    model: OPENAI_MODEL,
    messages: openAiMessages,
    temperature: 0.3,
    stream: true,
  });

  if (!openAiRequest.ok) {
    return NextResponse.json(
      { error: "OpenAI request failed." },
      { status: 502 }
    );
  }

  const openAiResponse = openAiRequest.response;

  if (!openAiResponse.ok || !openAiResponse.body) {
    const errorText = await openAiResponse.text().catch(() => "");
    console.error("chat: openai request failed", {
      status: openAiResponse.status,
      errorText,
    });
    return NextResponse.json(
      { error: "OpenAI request failed." },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantText = "";
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = openAiResponse.body!.getReader();

      try {
        let doneReading = false;
        while (!doneReading) {
          const { value, done } = await reader.read();
          if (done) {
            doneReading = true;
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.replace(/^data:\s*/, "");
            if (data === "[DONE]") {
              break;
            }

            try {
              const payload = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = payload.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                assistantText += delta;
                controller.enqueue(encoder.encode(delta));
              }
            } catch (error) {
              console.warn("chat: failed to parse openai chunk", error);
            }
          }
        }
      } catch (error) {
        console.error("chat: streaming error", error);
        controller.error(error);
      } finally {
        if (assistantText.trim()) {
          try {
            await createProjectMessage({
              projectId: project.id,
              role: "ASSISTANT",
              content: assistantText.trim(),
            });
            console.info("chat: assistant message saved", {
              userId: user.id,
              projectId: project.id,
            });
          } catch (error) {
            console.error("chat: failed to persist assistant message", error);
          }
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
