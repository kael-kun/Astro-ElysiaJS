import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  SESSION?: KVNamespace;
  AI: unknown;
}

export type UserRole = "admin" | "client";
export type BlogStatus = "draft" | "published";
export type BlogLogAction = "created" | "updated" | "published" | "deleted";
