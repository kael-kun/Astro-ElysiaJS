import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from "./projects.controller";
import type { CreateProjectInput, UpdateProjectInput } from "./projects.types";
import { parseAuthToken } from "../users/users.controller";

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function ProjectRoutes() {
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
      "/project",
      async ({ body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);

        const projectData: CreateProjectInput = {
          name: body.name,
          description: body.description,
        };

        try {
          const project = await createProject(projectData, env, authUser);
          return project;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create project";
          const status = message.includes("Forbidden") ? 403 : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          name: t.String({ maxLength: 100 }),
          description: t.Optional(t.String({ maxLength: 500 })),
        }),
      },
    )
    .get("/projects", async ({ query, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      const limit = parseInt(query.limit as string) || 10;
      const page = parseInt(query.page as string) || 1;

      try {
        const result = await getProjects(env, authUser, limit, page);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch projects";
        return errorResponse(message, 500);
      }
    })
    .get("/project/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);

      try {
        const project = await getProjectById(params.id, env, authUser);
        return project;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch project";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .put(
      "/project/:id",
      async ({ params, body, env, authUser }) => {
        console.log(authUser);
        if (!authUser) return errorResponse("Unauthorized", 401);

        const projectData: UpdateProjectInput = {
          name: body.name,
          description: body.description,
        };

        try {
          const project = await updateProject(params.id, projectData, env, authUser);
          return project;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to update project";
          const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          name: t.Optional(t.String({ maxLength: 100 })),
          description: t.Optional(t.String({ maxLength: 500 })),
        }),
      },
    )
    .delete("/project/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);

      try {
        await deleteProject(params.id, env, authUser);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete project";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    });

  return app;
}
