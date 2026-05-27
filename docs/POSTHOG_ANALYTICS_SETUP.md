# PostHog Analytics Setup

This app uses PostHog Cloud EU with:
- browser-side analytics through `posthog-js`
- a first-party proxy domain such as `metrics.dishgenie.app`
- consent gating before analytics initializes
- backend capture for durable authenticated events

## Runtime Variables

Frontend runtime:
- `POSTHOG_ENABLED=true`
- `POSTHOG_KEY=<posthog project token>`
- `POSTHOG_API_HOST=https://metrics.dishgenie.app`
- `POSTHOG_UI_HOST=https://eu.posthog.com`

Backend runtime:
- `POSTHOG_ENABLED=true`
- `POSTHOG_PROJECT_KEY=<posthog project token>`
- `POSTHOG_HOST=https://eu.i.posthog.com`

## Cloudflare Worker

Attach the Worker to `metrics.<your-domain>` and forward traffic to the EU PostHog hosts.

```js
const API_HOST = "eu.i.posthog.com";
const ASSET_HOST = "eu-assets.i.posthog.com";

async function handleRequest(request, ctx) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const pathWithParams = pathname + url.search;

  if (pathname.startsWith("/static/") || pathname.startsWith("/array/")) {
    let response = await caches.default.match(request);
    if (!response) {
      response = await fetch(`https://${ASSET_HOST}${pathWithParams}`);
      ctx.waitUntil(caches.default.put(request, response.clone()));
    }
    return response;
  }

  const originHeaders = new Headers(request.headers);
  originHeaders.delete("cookie");
  originHeaders.set(
    "X-Forwarded-For",
    request.headers.get("CF-Connecting-IP") || "",
  );

  return fetch(`https://${API_HOST}${pathWithParams}`, {
    method: request.method,
    headers: originHeaders,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : null,
    redirect: request.redirect,
  });
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, ctx);
  },
};
```

## Consent Behavior

- No PostHog initialization before opt-in
- No browser analytics events before opt-in
- Consent can be reopened from the footer
- Session replay is intentionally not enabled in this rollout
