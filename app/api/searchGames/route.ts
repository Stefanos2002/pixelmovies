export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/authDbConnection/mongo/page";
import { isMainstreamGame } from "@/app/Game Collection/functions";
import { PostResult } from "@/app/Constants/constants";

const EDITION_KEYWORDS_PATTERN = [
  "director.?s cut",
  "definitive edition",
  "remastered?",
  "enhanced edition",
  "royal edition",
  "complete edition",
  "game of the year",
  "goty edition",
  "anniversary edition",
  "deluxe edition",
  "ultimate edition",
  "legendary edition",
  "gold edition",
  "expanded edition",
  "extended edition",
  "redux",
].join("|");

const SEARCH_ALIASES: Record<string, string> = {
  gta: "grand theft auto",
  cod: "call of duty",
  rdr: "red dead redemption",
  re: "resident evil",
  ac: "assassin's creed",
  gow: "god of war",
  botw: "breath of the wild",
  totk: "tears of the kingdom",
};

function buildFlexibleRegex(query: string): string {
  const normalized = query
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  const wordPatterns = words.map((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Allow common word-separator chars between each letter so that
    // "spiderman" matches "Spider-Man", "ironman" matches "Iron Man", etc.
    // Includes curly apostrophes — RAWG names often use "Marvel’s".
    return escaped.split("").join("[\\s\\-'’‘.:]*");
  });

  // Between words allow any combination of separators + articles
  return wordPatterns.join("[\\s:,\\-.'’‘]*");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawQuery = searchParams.get("q")?.toLowerCase().trim();
  // Common abbreviations people type that never appear in RAWG names
  const query = rawQuery?.replace(
    /^(gta|cod|rdr|re|ac|gow|botw|totk)\b/,
    (abbr) => SEARCH_ALIASES[abbr] ?? abbr,
  );

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const gameCollection = db.collection("games");

    const flexibleRegex = buildFlexibleRegex(query);

    const today = new Date().toISOString().split("T")[0];
    const games = await gameCollection
      .find({
        $and: [
          { name: { $regex: flexibleRegex, $options: "i" } },
          { name: { $not: { $regex: EDITION_KEYWORDS_PATTERN, $options: "i" } } },
          { released: { $gte: "2000-01-01", $lte: today } },
          { tba: { $ne: true } },
          {
            $or: [
              { esrb_rating: null },
              { esrb_rating: { $exists: false } },
              { "esrb_rating.slug": { $ne: "adults-only" } },
            ],
          },
        ],
      })
      .project({
        id: 1,
        slug: 1,
        name: 1,
        background_image: 1,
        released: 1,
        parent_platforms: 1,
        rating: 1,
        metacritic: 1,
        ratings_count: 1,
        tba: 1,
        genres: 1,
        esrb_rating: 1,
      })
      // Generous cap: filtering happens below, so a small limit here could
      // drop the very game the user is looking for
      .limit(300)
      .toArray();

    const stripPunct = (s: string) =>
      s.toLowerCase().replace(/[\s\-'’‘.:,]+/g, "");
    const q = stripPunct(query);
    // Same quality rules as the games list, so search shows what the list shows
    const sorted = (games as unknown as PostResult[])
      .filter(isMainstreamGame)
      .sort((a, b) => {
      const aName = stripPunct(a.name as string);
      const bName = stripPunct(b.name as string);
      const aExact = aName === q;
      const bExact = bName === q;
      if (aExact !== bExact) return aExact ? -1 : 1;
      // Then most popular first, so "spiderman" shows Marvel's Spider-Man
      // before obscure 2000s titles that merely start with the query
      const popularity =
        (b.ratings_count ?? 0) - (a.ratings_count ?? 0);
      if (popularity !== 0) return popularity;
      return aName.localeCompare(bName);
    });

    return NextResponse.json({ results: sorted.slice(0, 4) }, { status: 200 });
  } catch (error) {
    console.error("Error searching games:", error);
    return NextResponse.json(
      { error: "Failed to search games", details: (error as Error).message },
      { status: 500 },
    );
  }
}
