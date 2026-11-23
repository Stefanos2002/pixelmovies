/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.pixelmovies.gr",
  generateRobotsTxt: true,
  exclude: [
    "/api/*",
    "/authentication/*",
    "/account/*",
    "/verified",
    "/games/construction",
    "/games-sitemap.xml",
  ],
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  robotsTxtOptions: {
    // Dynamic sitemap with every game page (app/games-sitemap.xml/route.ts)
    additionalSitemaps: ["https://www.pixelmovies.gr/games-sitemap.xml"],
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/account/", "/authentication/", "/verified"] },
    ],
  },
  additionalPaths: async (config) => [
    // Movies
    { loc: "/movies/movies-trending", changefreq: "daily", priority: 0.9 },
    { loc: "/movies/moviepage/1", changefreq: "daily", priority: 0.8 },
    { loc: "/movies/moviepage/2", changefreq: "daily", priority: 0.7 },
    { loc: "/movies/moviepage/3", changefreq: "daily", priority: 0.7 },
    { loc: "/movies/upcoming-movies/1", changefreq: "weekly", priority: 0.7 },
    // TV Shows
    { loc: "/movies/tvshows/trending", changefreq: "daily", priority: 0.9 },
    { loc: "/movies/tvshows/tvshowspage/1", changefreq: "daily", priority: 0.8 },
    { loc: "/movies/tvshows/tvshowspage/2", changefreq: "daily", priority: 0.7 },
    { loc: "/movies/tvshows/upcoming-tvshows/1", changefreq: "weekly", priority: 0.7 },
    // Games listing pages
    { loc: "/games/page/1", changefreq: "weekly", priority: 0.8 },
    { loc: "/games/page/2", changefreq: "weekly", priority: 0.7 },
    { loc: "/games/page/3", changefreq: "weekly", priority: 0.7 },
  ],
};
