import { createFileRoute } from "@tanstack/react-router";
import PackageCard from "../../components/PackageCard";
import { packages } from "../../data/packages";

export const Route = createFileRoute("/packages/")({
  component: PackagesPage,
});

function PackagesPage() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="mb-8">
        <p className="island-kicker mb-2">Registry</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Packages
        </h1>
        <p className="max-w-3xl text-base text-[var(--sea-ink-soft)]">
          Open-source packages for developers. Install, extend, and build with them.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((pkg, i) => (
          <PackageCard key={pkg.name} pkg={pkg} index={i} />
        ))}
      </div>
    </main>
  );
}
