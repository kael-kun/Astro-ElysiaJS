import { Elysia } from "elysia";
import { typedEnv } from "src/types/elysia";

export function rateLimiter() {
  return new Elysia().use(typedEnv).onRequest(async ({ request, env }) => {
    const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "anonymous";
    console.log("ip", ip);
    console.log("working rate limiter");
    const { success } = await env.MY_RATE_LIMITER.limit({
      key: ip,
    });

    if (!success) {
      return new Response("Too Many Requests", { status: 429 });
    }
  });
}
