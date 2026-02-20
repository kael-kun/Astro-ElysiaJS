import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";
import { parseAuthToken } from "../users/users.controller";
import {
  createBlog,
  getBlogById,
  getBlogs,
  updateBlog,
  deleteBlog,
  publishBlog,
  getBlogLogs,
} from "./blogs.controller";
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
      async ({ body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);

        console.log("body.image:", body.image);
        console.log("body.image type:", typeof body.image);
        console.log("body.image constructor:", body.image?.constructor?.name);

        const user_id = authUser.id;
        const blogData: CreateBlogInput = {
          user_id: user_id,
          title: body.title,
          description: body.description,
          content: body.content,
          meta_description: body.meta_description,
          status: (body.status as CreateBlogInput["status"]) || "draft",
          image: body.image,
          project_id: body.project_id,
        };
        try {
          const blog = await createBlog(blogData, env, authUser);
          console.log("Blog created successfully:", blog.id);
          return blog;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create blog";
          const status = message.includes("Forbidden") ? 403 : 400;
          console.error("Error creating blog:", message);
          return errorResponse(message, status);
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
      const limit = parseInt(query.limit as string) || 50;
      const offset = parseInt(query.offset as string) || 0;
      const status = query.status as string | undefined;
      const projectId = query.projectId as string | undefined;
      try {
        const result = await getBlogs(env, authUser, limit, offset, status, projectId);
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
      async ({ params, body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);
        console.log(body);
        const blogData: UpdateBlogInput = {
          title: body.title,
          description: body.description,
          content: body.content,
          meta_description: body.meta_description,
          status: body.status as UpdateBlogInput["status"],
          image_url: "temporary",
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
    })
    .get("/blog/:id/logs", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        const logs = await getBlogLogs(params.id, env, authUser);
        return { logs };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog logs";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    });

  return app;
}
