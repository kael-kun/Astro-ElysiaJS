import type { D1Database } from "@cloudflare/workers-types";
import type { DbUser, CreateUserInput, UpdateUserInput } from "src/types/database";

export interface Database {
  users: UserService;
}

export interface Env {
  DB: D1Database;
}

export function createDatabase(env: Env): Database {
  return {
    users: new UserService(env.DB),
  };
}

export class UserService {
  constructor(private db: D1Database) {}
  async create(data: CreateUserInput): Promise<DbUser> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .bind(id, data.email, data.password, data.name, data.role || "client", now, now)
      .run();

    if (!result.success) {
      throw new Error(`Failed to create user: ${result.error}`);
    }

    return {
      id,
      email: data.email,
      password_hash: data.password,
      name: data.name,
      role: data.role || "client",
      created_at: now,
      updated_at: now,
    };
  }

  async findById(id: string): Promise<DbUser | null> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM users WHERE id = ?
    `,
      )
      .bind(id)
      .first<DbUser>();

    return result || null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM users WHERE email = ?
    `,
      )
      .bind(email)
      .first<DbUser>();

    return result || null;
  }

  async findAll(): Promise<DbUser[]> {
    const result = await this.db
      .prepare(
        `
      SELECT * FROM users ORDER BY created_at DESC
    `,
      )
      .all<DbUser>();

    return result.results;
  }

  async update(id: string, data: UpdateUserInput): Promise<DbUser> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    const updated = {
      ...existing,
      email: data.email ?? existing.email,
      name: data.name ?? existing.name,
      role: data.role ?? existing.role,
      updated_at: new Date().toISOString(),
    };

    const result = await this.db
      .prepare(
        `
      UPDATE users SET email = ?, name = ?, role = ?, updated_at = ?
      WHERE id = ?
    `,
      )
      .bind(updated.email, updated.name, updated.role, updated.updated_at, id)
      .run();

    if (!result.success) {
      throw new Error(`Failed to update user: ${result.error}`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .prepare(
        `
      DELETE FROM users WHERE id = ?
    `,
      )
      .bind(id)
      .run();

    if (!result.success) {
      throw new Error(`Failed to delete user: ${result.error}`);
    }
  }
}
