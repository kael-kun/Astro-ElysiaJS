import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";

export const blogImagesRoute = new Elysia().use(typedEnv).get(
  "/blogs/images/:fileName",
  async ({ params, env }) => {
    const { fileName } = params;

    try {
      const object = await env.CMS_BUCKET.get(`blogs/${fileName}`);

      if (!object) {
        return new Response("Image not found", { status: 404 });
      }

      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (error) {
      console.error("Error fetching image:", error);
      return new Response("Error fetching image", { status: 500 });
    }
  },
  {
    params: t.Object({
      fileName: t.String(),
    }),
  },
);
