import { useEffect, useState } from "react";

const lines = [
  { text: "$ null-agent", delay: 0 },
  { text: "", delay: 300 },
  { text: "  ╔══════════════════════════════════════════════════╗", delay: 400 },
  { text: "  ║           null-agent v0.6.2                       ║", delay: 500 },
  { text: "  ║    Your coding assistant — now proactive          ║", delay: 600 },
  { text: "  ╚══════════════════════════════════════════════════╝", delay: 700 },
  { text: "", delay: 800 },
  { text: "  Provider: openai  Model: gpt-5.4  49 tools  ready", delay: 900 },
  { text: "  Project: my-app (main) ●  ⌨ coding  23m", delay: 1000 },
  { text: "", delay: 1100 },
  { text: "  💡 Upcoming event", delay: 1200 },
  { text: "  Standup in 5 minutes", delay: 1300 },
  { text: "", delay: 1500 },
  { text: "  > help me refactor the auth module", delay: 1800 },
  { text: "", delay: 2200 },
  { text: "  ● Reading src/auth/middleware.ts...", delay: 2400 },
  { text: "  ● Running shell: npx tsc --noEmit...", delay: 2800 },
  { text: "  ✓ All types check out.", delay: 3200 },
  { text: "", delay: 3400 },
  { text: "  I'll refactor the middleware to use", delay: 3500 },
  { text: "  a strategy pattern for auth providers.", delay: 3700 },
  { text: "  ● Writing src/auth/strategies/...", delay: 4000 },
  { text: "  ✓ Done. 3 files changed.", delay: 4400 },
];

export default function TerminalAnimation() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= lines.length) return;
    const timer = setTimeout(
      () => setVisibleCount((c) => c + 1),
      lines[visibleCount].delay - (visibleCount > 0 ? lines[visibleCount - 1].delay : 0),
    );
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="terminal-window overflow-hidden rounded-xl border border-[rgba(141,229,219,0.2)] bg-[#0a1418] shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-2 border-b border-[rgba(141,229,219,0.1)] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-[rgba(141,229,219,0.4)]">null-agent — bash</span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed text-[#d7ece8]">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line.text}
          </div>
        ))}
        {visibleCount < lines.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-[#60d7cf]" />
        )}
      </div>
    </div>
  );
}
