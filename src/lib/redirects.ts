import { prisma } from "@/lib/db";

interface RedirectEntry {
  destination: string;
  statusCode: number;
}

let cache: {
  data: Map<string, RedirectEntry>;
  expires: number;
} | null = null;

const CACHE_TTL_MS = 60_000;

export async function getRedirectMap(): Promise<Map<string, RedirectEntry>> {
  if (cache && Date.now() < cache.expires) return cache.data;

  const redirects = await prisma.redirect.findMany({
    where: { isActive: true },
    select: { source: true, destination: true, statusCode: true },
  });

  const map = new Map<string, RedirectEntry>(
    redirects.map((r) => [r.source, { destination: r.destination, statusCode: r.statusCode }])
  );

  cache = { data: map, expires: Date.now() + CACHE_TTL_MS };
  return map;
}

export function invalidateRedirectCache() {
  cache = null;
}
