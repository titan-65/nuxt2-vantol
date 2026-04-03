interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
  index?: number;
}

export default function FeatureCard({ title, description, icon, index = 0 }: FeatureCardProps) {
  return (
    <article
      className="island-shell feature-card rise-in rounded-2xl p-5"
      style={{ animationDelay: `${index * 90 + 80}ms` }}
    >
      {icon && <div className="mb-3 text-2xl">{icon}</div>}
      <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
      <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{description}</p>
    </article>
  );
}
