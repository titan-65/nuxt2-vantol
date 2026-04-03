import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  index?: number;
}

export default function FeatureCard({ title, description, icon, index = 0 }: FeatureCardProps) {
  return (
    <article
      className="island-shell feature-card rise-in rounded-2xl p-5"
      style={{ animationDelay: `${index * 90 + 80}ms` }}
    >
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(79,184,178,0.14)]">
          <div className="text-[var(--lagoon)]">{icon}</div>
        </div>
      )}
      <h2 className="mb-1.5 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
      <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{description}</p>
    </article>
  );
}
