import { NextRequest, NextResponse } from "next/server";

// Route folders that used to be capitalized. Old links (Google index,
// bookmarks, shared URLs) like /Games/page/1 get a permanent redirect to
// /games/page/1. Only these known static segments are lowercased, so
// dynamic values (search queries, slugs, ids) are left untouched.
const LEGACY_SEGMENTS = new Set([
  "Account",
  "Authentication",
  "Signin",
  "Signup",
  "Verified",
  "Games",
  "Movies",
  "TVShows",
  "Genres",
  "Trending",
  "TVShowsPage",
  "Upcoming-tvshows",
  "Upcoming-Movies",
  "Movies-trending",
  "moviePage",
  "Search",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const segments = pathname.split("/");
  let changed = false;

  const fixed = segments.map((seg, i) => {
    // Never touch the segment right after /search/ (the user's query)
    if (i > 0 && segments[i - 1].toLowerCase() === "search") return seg;
    if (LEGACY_SEGMENTS.has(seg)) {
      changed = true;
      return seg.toLowerCase();
    }
    return seg;
  });

  if (!changed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = fixed.join("/");
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Skip API routes, Next internals and static files
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.[\\w]+$).*)"],
};
