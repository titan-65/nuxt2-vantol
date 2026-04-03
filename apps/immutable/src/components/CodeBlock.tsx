import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[#0a1418]">
      {filename && (
        <div className="flex items-center justify-between border-b border-[rgba(141,229,219,0.1)] px-4 py-2">
          <span className="text-xs text-[rgba(141,229,219,0.4)]">{filename}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded px-2 py-1 text-xs text-[rgba(141,229,219,0.6)] transition hover:bg-[rgba(141,229,219,0.1)] hover:text-[#d7ece8]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-[#d7ece8]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
