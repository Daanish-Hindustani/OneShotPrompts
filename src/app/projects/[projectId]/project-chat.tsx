"use client";

import { useMemo, useState } from "react";

export type ChatMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

const initialFormState = {
  message: "",
};

function formatRole(role: ChatMessage["role"]) {
  if (role === "USER") return "You";
  if (role === "ASSISTANT") return "Assistant";
  return "System";
}

export function rollbackOptimisticMessages(
  currentMessages: ChatMessage[],
  userMessageId: string,
  assistantMessageId: string
) {
  return currentMessages.filter(
    (item) => item.id !== userMessageId && item.id !== assistantMessageId
  );
}

export default function ProjectChat({
  projectId,
  initialMessages,
}: {
  projectId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [formState, setFormState] = useState(initialFormState);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => {
    return !isSending && formState.message.trim().length > 0;
  }, [formState.message, isSending]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const message = formState.message.trim();
    setFormState(initialFormState);
    setIsSending(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${crypto.randomUUID()}`,
      role: "USER",
      content: message,
      createdAt: new Date().toISOString(),
    };

    const assistantId = `assistant-${crypto.randomUUID()}`;

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "ASSISTANT",
        content: "",
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const response = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const errorMessage = payload?.error ?? "Unable to send message.";
        setError(errorMessage);
        setMessages((prev) =>
          rollbackOptimisticMessages(prev, userMessage.id, assistantId)
        );
        setIsSending(false);
        return;
      }

      if (!response.body) {
        setError("No response body received.");
        setMessages((prev) =>
          rollbackOptimisticMessages(prev, userMessage.id, assistantId)
        );
        setIsSending(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let doneReading = false;
      while (!doneReading) {
        const { value, done } = await reader.read();
        if (done) {
          doneReading = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        setMessages((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? { ...item, content: `${item.content}${chunk}` }
              : item
          )
        );
      }
    } catch (err) {
      console.error("chat: failed to send message", err);
      setError("Unable to send message.");
      setMessages((prev) =>
        rollbackOptimisticMessages(prev, userMessage.id, assistantId)
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Chat
        </div>
        <div className="flex max-h-[420px] flex-col gap-4 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">
              Start the conversation by describing what you want to build.
            </p>
          ) : (
            messages.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  {formatRole(item.role)}
                </span>
                <p className="whitespace-pre-wrap text-sm text-slate-800">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          name="message"
          rows={4}
          placeholder="Describe the product you want to build..."
          value={formState.message}
          onChange={(event) =>
            setFormState({ message: event.target.value })
          }
          className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          disabled={isSending}
          required
        />
        {error ? (
          <p className="text-sm text-rose-600" role="status">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!canSend}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
}
