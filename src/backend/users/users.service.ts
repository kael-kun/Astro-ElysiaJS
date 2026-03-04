import type { D1Database } from "@cloudflare/workers-types";
import type { DbUser, CreateUserInput, UpdateUserInput } from "./users.types";

const VALIDATION = {
  name: { minLength: 1, maxLength: 100 },
  password: { minLength: 6, maxLength: 128 },
  email: { maxLength: 255 },
};

export class UserService {
  constructor(private db: D1Database) {}

  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw new Error("Name is required");
    }
    if (name.length > VALIDATION.name.maxLength) {
      throw new Error(`Name must be ${VALIDATION.name.maxLength} characters or less`);
    }
  }

  private validatePassword(password: string, isRequired = false): void {
    if (isRequired && !password) {
      throw new Error("Password is required");
    }
    if (password) {
      if (password.length < VALIDATION.password.minLength) {
        throw new Error(`Password must be at least ${VALIDATION.password.minLength} characters`);
      }
      if (password.length > VALIDATION.password.maxLength) {
        throw new Error(`Password must be ${VALIDATION.password.maxLength} characters or less`);
      }
    }
  }

  private validateEmail(email: string): void {
    if (!email || !email.trim()) {
      throw new Error("Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }
    if (email.length > VALIDATION.email.maxLength) {
      throw new Error(`Email must be ${VALIDATION.email.maxLength} characters or less`);
    }
  }

  async create(data: CreateUserInput): Promise<DbUser> {
    this.validateName(data.name);
    this.validateEmail(data.email);
    this.validatePassword(data.password, true);
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

    if (data.name !== undefined) {
      this.validateName(data.name);
    }
    if (data.email !== undefined) {
      this.validateEmail(data.email);
    }
    if (data.password !== undefined) {
      this.validatePassword(data.password, false);
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

interface ActivityLogInput {
  userId: string;
  entityType: "blog" | "project" | "user";
  entityId: string;
  entityName: string;
  action: "created" | "updated" | "deleted";
  details?: string;
}

export function createUserService(env: Env): UserService {
  return new UserService(env.DB);
}

export async function createActivityLog(db: D1Database, input: ActivityLogInput): Promise<void> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO activity_logs (id, user_id, entity_type, entity_id, entity_name, action, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.userId, input.entityType, input.entityId, input.entityName, input.action, input.details || null, now)
    .run();
}
