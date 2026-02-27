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
import { consumeRateLimitWithFallback, getClientIp } from "@/lib/rate-limit";
import { selectMessagesForContext } from "@/lib/chat-context";

const OPENAI_MODEL = "gpt-4o-mini";
const MAX_ASSISTANT_CHARS = 8000;
const MAX_CONTEXT_CHARS = 20_000;
const CHAT_IP_RATE_LIMIT_PER_MINUTE = 60;
const CHAT_USER_RATE_LIMIT_PER_MINUTE = 30;

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
  context: { params: Promise<{ projectId: string }> }
) {
  const params = await context.params;
  const clientIp = getClientIp(request);
  const ipLimit = await consumeRateLimitWithFallback({
    key: `chat:ip:${clientIp}`,
    limit: CHAT_IP_RATE_LIMIT_PER_MINUTE,
    windowMs: 60_000,
  });
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSeconds ?? 1) },
      }
    );
  }

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
  const userLimit = await consumeRateLimitWithFallback({
    key: `chat:user:${user.id}`,
    limit: CHAT_USER_RATE_LIMIT_PER_MINUTE,
    windowMs: 60_000,
  });
  if (!userLimit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(userLimit.retryAfterSeconds ?? 1) },
      }
    );
  }

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

  const openAiMessages = selectMessagesForContext(
    [
      buildSystemPrompt(),
      ...history.map((message) => ({
        role: mapRole(message.role),
        content: message.content,
      })),
    ],
    MAX_CONTEXT_CHARS
  ) satisfies OpenAIChatMessage[];

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
      let doneReading = false;
      let streamErrored = false;

      try {
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
              doneReading = true;
              break;
            }

            try {
              const payload = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = payload.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                const remaining = MAX_ASSISTANT_CHARS - assistantText.length;
                if (remaining <= 0) {
                  doneReading = true;
                  break;
                }
                const chunk = delta.slice(0, remaining);
                assistantText += chunk;
                controller.enqueue(encoder.encode(chunk));
                if (assistantText.length >= MAX_ASSISTANT_CHARS) {
                  doneReading = true;
                  break;
                }
              }
            } catch (error) {
              console.warn("chat: failed to parse openai chunk", error);
            }
          }
        }
      } catch (error) {
        console.error("chat: streaming error", error);
        streamErrored = true;
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
        if (!streamErrored) {
          controller.close();
        }
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
