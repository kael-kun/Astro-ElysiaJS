import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";
import { parseAuthToken } from "../users/users.controller";
import { generateBlog, generateMetadata } from "./generate-blog.controller";
import type { GenerateBlogInput } from "./generate-blog.types";

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function GenerateBlogRoutes() {
  const app = new Elysia();
  app
    .use(typedEnv)
    .derive(async ({ env, request }) => {
      const authHeader = request.headers.get("Authorization");
      const authUser = await parseAuthToken(authHeader ?? undefined, env);
      return { authUser };
    })
    .onBeforeHandle(({ authUser }) => {
      if (!authUser) {
        return errorResponse("Unauthorized", 401);
      }
    })
    .post(
      "/generate-blog-metadata",
      async ({ body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);
        try {
          const blogData: GenerateBlogInput = {
            topic: body.topic,
            keywords: body.keywords,
            tone: body.tone,
            audience: body.audience,
          };
          const metadata = await generateMetadata(blogData, env as Env);
          return metadata;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to generate metadata";
          return errorResponse(message, 500);
        }
      },
      {
        body: t.Object({
          topic: t.String({ required: true }),
          keywords: t.Optional(t.String()),
          tone: t.String({ required: true }),
          audience: t.String({ required: true }),
          projectId: t.String({ required: true }),
        }),
      },
    )
    .post(
      "/generate-blog",
      async ({ body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);
        try {
          const blogData: GenerateBlogInput = {
            topic: body.topic,
            keywords: body.keywords,
            tone: body.tone,
            audience: body.audience,
          };
          const stream = await generateBlog(blogData, env as Env, authUser);

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to generate blog";
          return errorResponse(message, 500);
        }
      },
      {
        body: t.Object({
          topic: t.String({ required: true }),
          keywords: t.Optional(t.String()),
          tone: t.String({ required: true }),
          audience: t.String({ required: true }),
          projectId: t.String({ required: true }),
        }),
      },
    );

  return app;
}
