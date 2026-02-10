import Elysia, { t } from "elysia";
import { typedEnv } from "../types/elysia";
import { generateBlog } from "../controller/generateBlog";
export function GenerateBlogRoutes() {
  const app = new Elysia();
  app.use(typedEnv).post(
    "/generate-blog",
    async ({ body, env }) => {
      const stream = await generateBlog(body, env);

      // Return as Server-Sent Event stream
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
    {
      body: t.Object({
        topic: t.String({ required: true }),
        keywords: t.String({ required: true }),
        tone: t.String({ required: true }),
        audience: t.String({ required: true }),
      }),
    },
  );
  return app;
}
