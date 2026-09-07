import { NextRequest } from "next/server";

// Spotify's cover art CDN doesn't send permissive CORS headers, so reading
// pixel data off it via <canvas> taints the canvas and getImageData() throws
// — this route re-serves the same bytes from our own origin so the browser
// sees a same-origin image instead. Only used for the archive's ambient
// color sampling, nothing else.
const ALLOWED_HOSTS = [/(^|\.)scdn\.co$/];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!ALLOWED_HOSTS.some((pattern) => pattern.test(parsed.hostname))) {
    return new Response("Forbidden host", { status: 403 });
  }

  const upstream = await fetch(parsed.toString());
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
