import { useState } from "react";

interface InstallTabsProps {
  packageName: string;
}

const managers = [
  { id: "npm", cmd: "npm install" },
  { id: "pnpm", cmd: "pnpm add" },
  { id: "yarn", cmd: "yarn add" },
] as const;

export default function InstallTabs({ packageName }: InstallTabsProps) {
  const [active, setActive] = useState<"npm" | "pnpm" | "yarn">("npm");
  const cmd = `${managers.find((m) => m.id === active)?.cmd} ${packageName}`;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[#0a1418]">
      <div className="flex border-b border-[rgba(141,229,219,0.1)]">
        {managers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActive(m.id)}
            className={`px-4 py-2 text-xs font-medium transition ${
              active === m.id
                ? "border-b-2 border-[#60d7cf] text-[#d7ece8]"
                : "text-[rgba(141,229,219,0.4)] hover:text-[#d7ece8]"
            }`}
          >
            {m.id}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm text-[#d7ece8]">
        <code>{cmd}</code>
      </pre>
    </div>
  );
}
