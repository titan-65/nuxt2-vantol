import { defineEventHandler } from "h3";
import { PORTFOLIO_KNOWLEDGE, SITE_PAGES } from "../../utils/sitemap";

export default defineEventHandler((_event) => {
  return {
    ok: true,
    knowledge: PORTFOLIO_KNOWLEDGE,
    pages: SITE_PAGES,
  };
});
