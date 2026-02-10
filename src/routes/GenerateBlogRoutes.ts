import Elysia, { t } from "elysia";
import { typedEnv } from "../types/elysia";
import { generateBlog } from "src/controller/generateBlog";

export async function GenerateBlogRoutes() {
  const app = new Elysia();
  app.use(typedEnv).post(
    "/generate-blog",
    async ({ body, env }) => {
      return await generateBlog(body, env);
    },
    {
      body: t.Object({
        topic: t.String(),
        keywords: t.Optional(t.String()),
        tone: t.String(),
        audience: t.String(),
        wordCount: t.Number(),
      }),
    },
  );
  return app;
}
