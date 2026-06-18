// Vite+ demo entry. The actual CLI binary lives in the Zero package
// (this directory's `zero.toml` and `src/*.0`); the Vite+ build is
// the static landing page for the project.

const title = document.querySelector("h1");
if (title) {
  title.textContent = "pi";
}
