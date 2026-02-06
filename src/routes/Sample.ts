import Elysia from "elysia";
import { typedEnv } from "../types/elysia";

export function SampleRoutes() {
  const app = new Elysia();
  app.use(typedEnv).get("/patrick", ({ env }) => {
    return Response.json({ x: env, message: "hello" });
  });
  return app;
}
