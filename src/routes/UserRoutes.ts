import Elysia, { t } from "elysia";
import { typedEnv } from "../types/elysia";
import { createUser, type CreateUserData } from "../controller/userController";
import { createDatabase, type Env } from "../services/database";
export function UserRoutes() {
  const app = new Elysia();
  app.use(typedEnv).post(
    "/user",
    async ({ body, env }) => {
      const authUser = {
        id: "1",
        email: "1",
        name: "1",
        role: "admin",
      };
      const userData: CreateUserData = {
        email: body.email,
        password: body.password,
        name: body.name,
        role: body.role as "admin" | "client" | undefined,
      };
      const db = createDatabase(env);
      return await createUser(userData, db, authUser);
    },
    {
      body: t.Object({
        email: t.String({ required: true }),
        password: t.String({ required: true }),
        name: t.String({ required: true }),
        role: t.Optional(t.String({ enum: ["admin", "client"] })),
      }),
    },
  );
  return app;
}
