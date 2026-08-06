import { defineEventHandler, getQuery } from "h3";
import { SITE_PAGES } from "../../utils/sitemap";

export default defineEventHandler((event) => {
  const queryObj = getQuery(event);
  const rawQ = queryObj.q;
  const q = typeof rawQ === "string" ? rawQ.trim().toLowerCase() : "";

  if (!q) {
    return { ok: true, results: SITE_PAGES };
  }

  const results = SITE_PAGES.filter(
    (page) =>
      page.title.toLowerCase().includes(q) ||
      page.description.toLowerCase().includes(q) ||
      page.keywords.some((k) => k.includes(q)),
  );

  return { ok: true, results };
});
