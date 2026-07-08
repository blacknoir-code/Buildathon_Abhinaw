"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { api } from "@/lib/api";
import { addHistory } from "@/lib/store";
import { cn, nanoId } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "Why did CTR fall this week?",
  "Generate 5 Instagram hooks",
  "Translate the headline to Marathi",
  "Predict the top risks",
  "Make the copy shorter",
];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi 👋 I'm your **GrowthPilot Copilot**. I can diagnose metrics, generate creatives, rewrite copy, translate into any Indian language, or predict risks — all with your campaign context loaded.\n\nTry one of the prompts below to get started.",
  createdAt: new Date(0).toISOString(),
};

export function Copilot({
  open,
  onClose,
  campaignContext,
}: {
  open: boolean;
  onClose: () => void;
  campaignContext?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const userMsg: ChatMessage = {
      id: nanoId("m_"),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    const replyId = nanoId("m_");
    setMessages([
      ...next,
      { id: replyId, role: "assistant", content: "", createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setLoading(true);
    try {
      const { text } = await api.chatStream(
        {
          messages: next
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
          campaignContext,
        },
        (_chunk, full) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === replyId ? { ...m, content: full } : m)),
          );
        },
      );
      addHistory({ action: "Copilot chat", prompt: content, response: text.slice(0, 120) });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === replyId
            ? { ...m, content: "Something went wrong reaching the Copilot. Please try again." }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] glass-strong border-l border-border flex flex-col transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="grid place-items-center size-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-500">
            <Sparkles className="size-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Copilot</div>
            <div className="text-[11px] text-muted-foreground">
              Always-on AI teammate
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.map((m) =>
          m.role === "assistant" && m.content === "" ? null : (
          <div
            key={m.id}
            className={cn(
              "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-muted/60 border border-border",
            )}
          >
            {m.role === "user" ? (
              <span className="whitespace-pre-wrap">{m.content}</span>
            ) : (
              <Markdown content={m.content} />
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[11px] rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-border flex items-center gap-2 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your campaign…"
          className="flex-1 h-10 rounded-lg border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
