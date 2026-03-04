import Elysia from "elysia";
import { typedEnv } from "src/types/elysia";
import { parseAuthToken } from "../users/users.controller";
import { createBlogService } from "../blogs/blogs.service";
import { createProjectService } from "../projects/projects.service";
import { createUserService } from "../users/users.service";

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export interface DashboardStats {
  totalUsers?: number;
  totalBlogs: number;
  totalProjects: number;
  totalViews: number;
  myBlogs?: number;
  myProjects?: number;
  myViews?: number;
  publishedBlogs?: number;
  myPublishedBlogs?: number;
}

export interface DashboardLog {
  id: string;
  entity_type: "blog" | "project" | "user";
  entity_id: string;
  entity_title: string | null;
  action: string;
  details: string | null;
  user_name: string | null;
  created_at: string;
}

export interface DashboardLogsResponse {
  logs: DashboardLog[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getDashboardStats(env: Env, authUser: { id: string; role: string }): Promise<DashboardStats> {
  const isAdmin = authUser.role === "admin";

  const blogService = createBlogService(env);
  const projectService = createProjectService(env);
  const userService = createUserService(env);

  if (isAdmin) {
    const usersResult = await userService.findAll(1, 1);
    const blogsResult = await blogService.findAll(1, 1);
    const projectsResult = await projectService.findAll(1, 1);
    const viewsResult = await blogService.getTotalViews();
    const publishedResult = await blogService.getPublishedCount();

    return {
      totalUsers: usersResult.total,
      totalBlogs: blogsResult.total,
      totalProjects: projectsResult.total,
      totalViews: viewsResult.total,
      publishedBlogs: publishedResult.total,
    };
  } else {
    const myBlogsResult = await blogService.findByUserId(authUser.id, 1, 1);
    const myProjectsResult = await projectService.findByUserId(authUser.id, 1, 1);
    const myViewsResult = await blogService.getTotalViewsByUserId(authUser.id);
    const myPublishedResult = await blogService.getPublishedCountByUserId(authUser.id);

    return {
      totalBlogs: myBlogsResult.total,
      totalProjects: myProjectsResult.total,
      totalViews: myViewsResult.total,
      myBlogs: myBlogsResult.total,
      myProjects: myProjectsResult.total,
      myViews: myViewsResult.total,
      myPublishedBlogs: myPublishedResult.total,
    };
  }
}

export async function getDashboardLogs(
  env: Env,
  authUser: { id: string; role: string },
  limit = 5,
  page = 1,
): Promise<DashboardLogsResponse> {
  const isAdmin = authUser.role === "admin";
  const offset = (page - 1) * limit;

  let countQuery = "SELECT COUNT(*) as total FROM activity_logs al";
  let logsQuery = `
    SELECT 
      al.id, 
      al.entity_type,
      al.entity_id, 
      COALESCE(al.entity_name, al.details) as entity_title, 
      al.action, 
      al.details, 
      u.name as user_name, 
      al.created_at 
    FROM activity_logs al 
    LEFT JOIN users u ON al.user_id = u.id
  `;
  const params: (string | number)[] = [];

  if (!isAdmin) {
    countQuery += " WHERE al.user_id = ?";
    logsQuery += " WHERE al.user_id = ?";
    params.push(authUser.id);
  }

  logsQuery += isAdmin
    ? " ORDER BY al.created_at DESC LIMIT ? OFFSET ?"
    : " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const countResult = await env.DB.prepare(countQuery)
    .bind(...(isAdmin ? [] : [authUser.id]))
    .first<{ total: number }>();
  const total = countResult?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const result = await env.DB.prepare(logsQuery)
    .bind(...params)
    .all<DashboardLog>();

  return {
    logs: result.results,
    total,
    page,
    totalPages,
  };
}

export function DashboardRoutes() {
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
    .get("/stats", async ({ env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        const stats = await getDashboardStats(env, authUser);
        return stats;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch stats";
        return errorResponse(message, 500);
      }
    })
    .get("/logs", async ({ query, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        const limit = parseInt(query.limit as string) || 5;
        const page = parseInt(query.page as string) || 1;
        const logs = await getDashboardLogs(env, authUser, limit, page);
        return logs;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch logs";
        return errorResponse(message, 500);
      }
    });

  return app;
}
