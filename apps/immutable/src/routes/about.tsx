import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Immutable
        </h1>
        <p className="mb-4 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          A package registry and showcase for open-source developer tools. Built with TanStack
          Start, Tailwind CSS, and shadcn/ui.
        </p>
        <p className="max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          The flagship package is{" "}
          <Link to="/null-agent" className="text-[var(--lagoon-deep)]">
            null-agent
          </Link>
          , an interactive coding assistant library with multi-provider LLM support. Browse all
          packages on the{" "}
          <Link to="/packages" className="text-[var(--lagoon-deep)]">
            packages page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
