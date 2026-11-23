import { getAllGames } from "@/app/Game Collection/functions";

// Sitemap of every game detail page, generated from the database so newly
// added games are picked up automatically. Linked from /sitemap.xml and
// robots.txt via next-sitemap's additionalSitemaps.
export const revalidate = 86400; // rebuild at most once a day

const SITE = "https://www.pixelmovies.gr";
const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET() {
  const games = await getAllGames();
  const seen = new Set<string>();

  const urls = games
    .filter((g) => g.slug && !seen.has(g.slug) && seen.add(g.slug))
    .slice(0, 50000) // sitemap protocol limit
    .map(
      (g) =>
        `<url><loc>${SITE}/games/${escapeXml(g.slug)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
