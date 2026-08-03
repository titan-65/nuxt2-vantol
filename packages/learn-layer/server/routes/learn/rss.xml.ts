import { defineEventHandler, getRequestURL, setHeader } from "h3";
import { queryCollection } from "@nuxt/content/server";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default defineEventHandler(async (event) => {
  const {
    public: { siteUrl },
  } = useRuntimeConfig();
  const baseUrl = siteUrl || getRequestURL(event).origin;

  const docs = (await queryCollection(event, "tutorials").all()) as any[];

  const series = docs
    .filter((doc) => !doc.order && doc.path?.split("/").filter(Boolean).length === 2)
    .sort(
      (a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime(),
    );

  const items = series
    .map((doc) => {
      const link = `${baseUrl}${doc.path}`;
      const pubDate = doc.releaseDate || doc.createdAt;

      return `\n    <item>\n      <title>${escapeXml(doc.title || "")}</title>\n      <link>${escapeXml(link)}</link>\n      <guid>${escapeXml(link)}</guid>\n      <description>${escapeXml(doc.description || "")}</description>\n      ${pubDate ? `<pubDate>${new Date(pubDate).toUTCString()}</pubDate>` : ""}\n      ${doc.nuxtVersion ? `<category>Nuxt v${escapeXml(doc.nuxtVersion)}</category>` : ""}\n    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>VantolBennett Learn</title>\n    <link>${escapeXml(`${baseUrl}/learn`)}</link>\n    <description>Hands-on tutorials learning new Nuxt features, one release at a time.</description>\n    ${items}\n  </channel>\n</rss>`;

  setHeader(event, "content-type", "application/rss+xml");
  return xml;
});
