import * as React from "react";

// Minimal, dependency-free markdown renderer. Handles the subset the
// AI agents actually emit: headings, bold, inline code, bullet and
// numbered lists, blockquotes, and paragraphs. Enough for chat +
// analytics narratives without pulling in a full markdown library.

function inline(text: string, keyBase: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(
        <strong key={`${keyBase}-b-${i++}`} className="font-semibold text-foreground">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={`${keyBase}-c-${i++}`}
          className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flush = () => {
    if (!list) return;
    const items = list.items;
    blocks.push(
      list.ordered ? (
        <ol key={key++} className="list-decimal pl-5 space-y-1 my-2">
          {items.map((it, i) => (
            <li key={i}>{inline(it, `li${key}-${i}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key++} className="space-y-1 my-2">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary mt-1 leading-none">•</span>
              <span>{inline(it, `li${key}-${i}`)}</span>
            </li>
          ))}
        </ul>
      ),
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)/);
    const bullet = line.match(/^[-*]\s+(.*)/);
    const num = line.match(/^\d+\.\s+(.*)/);
    const quote = line.match(/^>\s?(.*)/);

    if (h) {
      flush();
      const level = h[1].length;
      const cls =
        level === 1 ? "text-lg font-semibold mt-3 mb-1" : "text-base font-semibold mt-2 mb-1";
      blocks.push(
        <p key={key++} className={cls}>
          {inline(h[2], `h${key}`)}
        </p>,
      );
    } else if (bullet) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (num) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(num[1]);
    } else if (quote) {
      flush();
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-2 border-primary pl-3 my-2 italic text-foreground/90"
        >
          {inline(quote[1], `q${key}`)}
        </blockquote>,
      );
    } else {
      flush();
      blocks.push(
        <p key={key++} className="my-1.5 leading-relaxed">
          {inline(line, `p${key}`)}
        </p>,
      );
    }
  }
  flush();

  return <div className="text-sm text-muted-foreground">{blocks}</div>;
}
