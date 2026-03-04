import { Elysia } from "elysia";
import type { APIRoute } from "astro";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { openapi } from "@elysiajs/openapi";
import {
  UserRoutes,
  BlogRoutes,
  GenerateBlogRoutes,
  ProjectRoutes,
  ApiKeyRoutes,
  PublicBlogRoutes,
  DashboardRoutes,
} from "src/backend";
import { blogImagesRoute } from "src/backend/blogs/images.route";
import { rateLimiter } from "src/backend/ratelimit/rate-limiter";

const handle: APIRoute = async (ctx) => {
  const app = new Elysia({
    prefix: "/api",
    adapter: CloudflareAdapter,
    aot: false,
    normalize: true,
  })
    .use(openapi())
    .use(rateLimiter());
  app
    .decorate({
      env: ctx.locals.runtime.env,
      urlData: ctx.url,
      astroCookies: ctx.cookies,
    })
    .use(blogImagesRoute)
    .use(GenerateBlogRoutes())
    .use(UserRoutes())
    .use(BlogRoutes())
    .use(ProjectRoutes())
    .use(ApiKeyRoutes())
    .use(PublicBlogRoutes())
    .use(DashboardRoutes());

  return await app.handle(ctx.request);
};

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const HEAD = handle;
export const OPTIONS = handle;
export const TRACE = handle;
export const CONNECT = handle;
export const LINK = handle;
export const UNLINK = handle;
