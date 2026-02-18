import type { D1Database } from "@cloudflare/workers-types";
import type { DbUser, CreateUserInput, UpdateUserInput } from "./users.types";

export class UserService {
  constructor(private db: D1Database) {}

  async create(data: CreateUserInput): Promise<DbUser> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    const result = await this.db.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<DbUser>();
    return result || null;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const result = await this.db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first<DbUser>();
    return result || null;
  }

  async findAll(limit = 10, page = 1): Promise<{ users: DbUser[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.db.prepare("SELECT COUNT(*) as total FROM users").first<{ total: number }>();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    const result = await this.db
      .prepare(`SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(limit, offset)
      .all<DbUser>();

    return { users: result.results, total, page, totalPages };
  }

  async update(id: string, data: UpdateUserInput): Promise<DbUser> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("User not found");
    }

    const hasPasswordUpdate = data.password !== undefined;
    const updated = {
      ...existing,
      email: data.email ?? existing.email,
      name: data.name ?? existing.name,
      role: data.role ?? existing.role,
      password_hash: data.password ?? existing.password_hash,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (hasPasswordUpdate) {
      result = await this.db
        .prepare(`UPDATE users SET email = ?, name = ?, role = ?, password_hash = ?, updated_at = ? WHERE id = ?`)
        .bind(updated.email, updated.name, updated.role, updated.password_hash, updated.updated_at, id)
        .run();
    } else {
      result = await this.db
        .prepare(`UPDATE users SET email = ?, name = ?, role = ?, updated_at = ? WHERE id = ?`)
        .bind(updated.email, updated.name, updated.role, updated.updated_at, id)
        .run();
    }

    if (!result.success) {
      throw new Error(`Failed to update user: ${result.error}`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.prepare(`DELETE FROM users WHERE id = ?`).bind(id).run();

    if (!result.success) {
      throw new Error(`Failed to delete user: ${result.error}`);
    }
  }
}

export function createUserService(env: Env): UserService {
  return new UserService(env.DB);
}
