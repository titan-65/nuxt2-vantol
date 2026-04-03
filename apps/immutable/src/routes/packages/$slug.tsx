import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPackageBySlug } from "../../data/packages";
import InstallTabs from "../../components/InstallTabs";

export const Route = createFileRoute("/packages/$slug")({
  loader: ({ params }) => {
    const pkg = getPackageBySlug(params.slug);
    if (!pkg) throw notFound();
    return { pkg };
  },
  component: PackageDetailPage,
});

function PackageDetailPage() {
  const { pkg } = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 py-12">
      <Link
        to="/packages"
        className="mb-6 inline-block text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
      >
        &larr; All packages
      </Link>

      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="display-title text-4xl font-bold text-[var(--sea-ink)]">{pkg.name}</h1>
          <span className="rounded-full bg-[rgba(79,184,178,0.14)] px-3 py-1 text-sm font-medium text-[var(--lagoon-deep)]">
            v{pkg.version}
          </span>
        </div>
        <p className="mb-6 max-w-3xl text-base text-[var(--sea-ink-soft)]">{pkg.description}</p>

        <div className="mb-6 flex gap-3">
          <a
            href={pkg.npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            npm
          </a>
          <a
            href={pkg.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            GitHub
          </a>
        </div>

        <InstallTabs packageName={pkg.npmName} />
      </section>

      {pkg.features && (
        <section className="mt-8">
          <p className="island-kicker mb-4">Features</p>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
            {pkg.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
