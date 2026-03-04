import Elysia, { t } from "elysia";
import { typedEnv } from "src/types/elysia";
import {
  createUser,
  getUsers,
  getUserById,
  parseAuthToken,
  deleteUser,
  updateUser,
  loginUser,
  createUserForTesting,
} from "./users.controller";
import type { CreateUserInput, UpdateUserInput } from "./users.types";
function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function UserRoutes() {
  const app = new Elysia();
  app
    .use(typedEnv)
    .derive(async ({ env, request }) => {
      const authHeader = request.headers.get("Authorization");
      const authUser = await parseAuthToken(authHeader ?? undefined, env);
      return { authUser };
    })
    .post(
      "/create-admin-for-testing",
      async ({ body, env }) => {
        const userData: CreateUserInput = {
          email: body.email,
          password: body.password,
          name: body.name,
          role: body.role as CreateUserInput["role"],
        };
        try {
          const user = await createUserForTesting(userData, env);
          return user;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create user";
          const status = message.includes("Forbidden") ? 403 : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          email: t.String({ maxLength: 255 }),
          password: t.String({ minLength: 6, maxLength: 128 }),
          name: t.String({ maxLength: 100 }),
          role: t.Optional(t.String({ enum: ["admin", "client"] })),
        }),
      },
    )
    .post(
      "/login",
      async ({ body, env, set }) => {
        try {
          const result = await loginUser(body.email, body.password, env);
          set.headers["Set-Cookie"] =
            `auth_token=${result.token}; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/`;
          return result;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          return errorResponse(message, 400);
        }
      },
      {
        body: t.Object({
          email: t.String({ maxLength: 255 }),
          password: t.String({ minLength: 6, maxLength: 128 }),
        }),
      },
    )
    .post("/logout", async ({ set }) => {
      set.headers["Set-Cookie"] = "auth_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/";
      return { success: true };
    })
    .onBeforeHandle(({ authUser }) => {
      if (!authUser) {
        return errorResponse("Unauthorized", 401);
      }
    })
    .post(
      "/user",
      async ({ body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);
        const userData: CreateUserInput = {
          email: body.email,
          password: body.password,
          name: body.name,
          role: body.role as CreateUserInput["role"],
        };
        try {
          const user = await createUser(userData, env, authUser);
          return user;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to create user";
          const status = message.includes("Forbidden") ? 403 : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          email: t.String({ maxLength: 255 }),
          password: t.String({ minLength: 6, maxLength: 128 }),
          name: t.String({ maxLength: 100 }),
          role: t.Optional(t.String({ enum: ["admin", "client"] })),
        }),
      },
    )
    .get("/users", async ({ query, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      const limit = parseInt(query.limit as string) || 10;
      const page = parseInt(query.page as string) || 1;
      try {
        const result = await getUsers(env, authUser, limit, page);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch users";
        const status = message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .get("/user/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        const user = await getUserById(params.id, env, authUser);
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch user";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .delete("/user/:id", async ({ params, env, authUser }) => {
      if (!authUser) return errorResponse("Unauthorized", 401);
      try {
        await deleteUser(params.id, env, authUser);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete user";
        const status = message.includes("not found") ? 404 : message.includes("Forbidden") ? 403 : 500;
        return errorResponse(message, status);
      }
    })
    .put(
      "/user/:id",
      async ({ params, body, env, authUser }) => {
        if (!authUser) return errorResponse("Unauthorized", 401);
        const userData: UpdateUserInput = {
          email: body.email,
          name: body.name,
          role: body.role as UpdateUserInput["role"],
          password: body.password,
        };
        try {
          const user = await updateUser(params.id, userData, env, authUser);
          return user;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to update user";
          const status = message.includes("not found")
            ? 404
            : message.includes("Forbidden")
              ? 403
              : message.includes("exists")
                ? 409
                : 400;
          return errorResponse(message, status);
        }
      },
      {
        body: t.Object({
          email: t.Optional(t.String({ maxLength: 255 })),
          name: t.Optional(t.String({ maxLength: 100 })),
          password: t.Optional(t.String({ minLength: 6, maxLength: 128 })),
          role: t.Optional(t.String({ enum: ["admin", "client"] })),
        }),
      },
    );

  return app;
}
