import "./style.css";

// Hero CTA smooth scroll
document.querySelector('a[href="#code-section"]')?.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("code-section")?.scrollIntoView({ behavior: "smooth" });
});
