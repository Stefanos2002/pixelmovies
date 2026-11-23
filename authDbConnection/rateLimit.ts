import clientPromise from "./mongo/page";

let indexReady = false;

/**
 * Fixed-window rate limiter stored in MongoDB, so it works across serverless
 * instances. Returns true when the call is allowed.
 *   await rateLimit(`signup:${ip}`, 5, 60 * 60)  -> 5 per hour per IP
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const col = client.db().collection<{ _id: string; count: number; expiresAt: Date }>(
      "rate_limits",
    );
    if (!indexReady) {
      indexReady = true;
      // MongoDB deletes each window's counter automatically once it expires
      await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }

    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const doc = await col.findOneAndUpdate(
      { _id: `${key}:${window}` },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          expiresAt: new Date((window + 1) * windowSeconds * 1000),
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    return (doc?.count ?? 1) <= limit;
  } catch (error) {
    // Never lock everyone out because the limiter itself failed
    console.error("Rate limiter error:", error);
    return true;
  }
}

/** Best-effort client IP behind Vercel / proxies. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
