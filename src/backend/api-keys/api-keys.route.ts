import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";
import { createApiKey, getApiKeys, deleteApiKey } from "./api-keys.controller";
import { parseAuthToken } from "../users/users.controller";

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function ApiKeyRoutes() {
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
      "/project/:id/keys",
      async ({ params, body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);

        try {
          const apiKey = await createApiKey(params.id, { name: body.name, project_id: params.id }, env, authUser);
          return apiKey;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create API key";
          const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          name: t.String({ maxLength: 100 }),
        }),
      },
    )
    .get("/project/:id/keys", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);

      try {
        const keys = await getApiKeys(params.id, env, authUser);
        return keys;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch API keys";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .delete("/keys/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);

      try {
        await deleteApiKey(params.id, env, authUser);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete API key";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    });

  return app;
}
