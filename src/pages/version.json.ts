export const prerender = true;

export function GET() {
  return new Response(
    JSON.stringify({
      buildId: import.meta.env.PUBLIC_BUILD_ID ?? "local",
      builtAt: new Date().toISOString()
    }),
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    }
  );
}
