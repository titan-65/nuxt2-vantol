import { Link } from "@tanstack/react-router";
import type { PackageInfo } from "../data/packages";

interface PackageCardProps {
  pkg: PackageInfo;
  index?: number;
}

export default function PackageCard({ pkg, index = 0 }: PackageCardProps) {
  return (
    <Link
      to="/packages/$slug"
      params={{ slug: pkg.name }}
      className="island-shell feature-card rise-in block rounded-2xl p-5 no-underline"
      style={{ animationDelay: `${index * 90 + 80}ms` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">{pkg.name}</h2>
        <span className="rounded-full bg-[rgba(79,184,178,0.14)] px-2 py-0.5 text-xs font-medium text-[var(--lagoon-deep)]">
          {pkg.version}
        </span>
      </div>
      <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{pkg.description}</p>
      <code className="mt-3 block text-xs">{pkg.installCmd}</code>
    </Link>
  );
}
