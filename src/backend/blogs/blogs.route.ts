import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";
import { parseAuthToken } from "../users/users.controller";
import { createBlog, getBlogById, getBlogs, updateBlog, deleteBlog, publishBlog, storeImage } from "./blogs.controller";
import type { CreateBlogInput, UpdateBlogInput } from "./blogs.types";

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function BlogRoutes() {
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
      "/blog",
      async ({ body, env, authUser, request }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);
        try {
          let imagePath: string | undefined;
          // get origin
          const origin = new URL(request.url).origin;
          if (body.image) {
            const imageFileName = await storeImage(body.image, env);
            imagePath = `${origin}/api/images/${imageFileName}`;
          }

          console.log(imagePath);

          const blogData: CreateBlogInput = {
            user_id: authUser.id,
            title: body.title,
            description: body.description,
            content: body.content,
            meta_description: body.meta_description,
            status: (body.status as CreateBlogInput["status"]) || "draft",
            image: imagePath,
            project_id: body.project_id,
          };
          const blog = await createBlog(blogData, env, authUser);
          return blog;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create blog";
          return errorResponse(message, 400);
        }
      },
      {
        body: t.Object({
          title: t.String({ required: true }),
          description: t.String({ required: true }),
          content: t.String({ required: true }),
          meta_description: t.Optional(t.String()),
          status: t.String({ enum: ["draft", "published"], required: true }),
          image: t.Optional(t.File()),
          project_id: t.String({ required: true }),
        }),
      },
    )
    .get("/blogs", async ({ query, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      const limit = parseInt(query.limit as string) || 10;
      const page = parseInt(query.page as string) || 1;
      const status = query.status as string | undefined;
      const projectId = query.projectId as string | undefined;
      try {
        const result = await getBlogs(env, authUser, limit, page, status, projectId);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch blogs";
        const status = message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .get("/blog/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        const blog = await getBlogById(params.id, env, authUser);
        return blog;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .put(
      "/blog/:id",
      async ({ params, body, env, authUser, request }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);

        let imageUrl: string | undefined;
        if (body.image) {
          const origin = new URL(request.url).origin;
          const imageFileName = await storeImage(body.image, env);
          imageUrl = `${origin}/api/images/${imageFileName}`;
        }

        const blogData: UpdateBlogInput = {
          title: body.title,
          description: body.description,
          content: body.content,
          meta_description: body.meta_description,
          status: body.status as UpdateBlogInput["status"],
          image_url: imageUrl,
        };
        try {
          const blog = await updateBlog(params.id, blogData, env, authUser);
          return blog;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to update blog";
          const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          content: t.Optional(t.String()),
          meta_description: t.Optional(t.String()),
          status: t.Optional(t.String({ enum: ["draft", "published"] })),
          image: t.Optional(t.File()),
        }),
      },
    )
    .delete("/blog/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        await deleteBlog(params.id, env, authUser);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete blog";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .post("/blog/:id/publish", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        const blog = await publishBlog(params.id, env, authUser);
        return blog;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to publish blog";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    });

  return app;
}
