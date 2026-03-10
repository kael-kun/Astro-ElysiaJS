import Elysia from "elysia";
import { typedEnv } from "src/types/elysia";
import { verifyApiKey } from "./api-keys.controller";
import { createBlogService } from "../blogs/blogs.service";
import { recordBlogView } from "../blogs/blogs.controller";
import type { BlogResponse } from "../blogs/blogs.types";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(keyId: string): boolean {
  const now = Date.now();
  const record = rateLimitStore[keyId];

  if (!record || now > record.resetTime) {
    rateLimitStore[keyId] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toBlogResponse(blog: {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  meta_description: string | null;
  status: string;
  image_url: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}): BlogResponse {
  return {
    id: blog.id,
    user_id: blog.user_id,
    title: blog.title,
    description: blog.description,
    content: blog.content,
    meta_description: blog.meta_description,
    status: blog.status as "draft" | "published",
    image_url: blog.image_url,
    project_id: blog.project_id,
    createdAt: blog.created_at,
    updatedAt: blog.updated_at,
    project_name: undefined,
    user_name: undefined,
  };
}

export function PublicBlogRoutes() {
  const app = new Elysia();

  app
    .use(typedEnv)
    .derive(async ({ env, request }) => {
      const apiKeyHeader = request.headers.get("X-API-Key");
      let apiKeyId: string | null = null;
      let isValid = false;
      const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
      const userAgent = request.headers.get("User-Agent") || undefined;
      const referer = request.headers.get("Referer") || undefined;
      
      if (apiKeyHeader) {
        const result = await verifyApiKey(apiKeyHeader, env);
        if (result.valid && result.apiKey) {
          apiKeyId = result.apiKey.id;
          isValid = true;
        }
      }

      return { apiKeyId, isValid, apiKeyHeader, ip, userAgent, referer };
    })
    .onBeforeHandle(({ isValid, apiKeyId }) => {
      if (!isValid || !apiKeyId) {
        return errorResponse("Invalid or missing API key", 401);
      }
    })
    .get("/public/:projectId/blogs", async ({ params, query, env, apiKeyId }) => {
      if (!apiKeyId) return errorResponse("Invalid API key", 401);

      if (!checkRateLimit(apiKeyId)) {
        return errorResponse("Rate limit exceeded. Please try again later.", 429);
      }

      const limit = parseInt(query.limit as string) || 10;
      const page = parseInt(query.page as string) || 1;

      try {
        const blogService = createBlogService(env);
        const result = await blogService.findByProjectId(params.projectId, limit, page, "published");
        return {
          results: result.blogs.map((blog) => ({
            blog_id: blog.id,
            title: blog.title,
            description: blog.description,
            meta_description: blog.meta_description,
            image_url: blog.image_url,
            status: blog.status,
            view_count: blog.view_count,
            createdAt: blog.created_at,
            updatedAt: blog.updated_at,
          })),
          total: result.total,
          page,
          totalPages: result.totalPages,
        };
      } catch (err) {
        console.error("Error fetching blogs:", err);
        return errorResponse("Failed to fetch blogs", 500);
      }
    })
    .get("/public/:projectId/blogs/:id", async ({ params, env, apiKeyId, ip, userAgent, referer }) => {
      if (!apiKeyId) return errorResponse("Invalid API key", 401);

      if (!checkRateLimit(apiKeyId)) {
        return errorResponse("Rate limit exceeded. Please try again later.", 429);
      }

      try {
        const blogService = createBlogService(env);
        const blog = await blogService.findById(params.id);

        if (!blog) {
          return errorResponse("Blog not found", 404);
        }

        if (blog.project_id !== params.projectId) {
          return errorResponse("Blog does not belong to this project", 403);
        }

        if (blog.status !== "published") {
          return errorResponse("Blog not found", 404);
        }

        const ipHash = await hashIp(ip);
        recordBlogView(params.id, env, ipHash, userAgent, referer);

        return {
          blog_id: blog.id,
          title: blog.title,
          description: blog.description,
          content: blog.content,
          meta_description: blog.meta_description,
          image_url: blog.image_url,
          status: blog.status,
          view_count: blog.view_count,
          createdAt: blog.created_at,
          updatedAt: blog.updated_at,
        };
      } catch (err) {
        console.error("Error fetching blog:", err);
        return errorResponse("Failed to fetch blog", 500);
      }
    });

  return app;
}
