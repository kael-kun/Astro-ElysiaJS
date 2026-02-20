import type { D1Database } from "@cloudflare/workers-types";
import type { DbProject, CreateProjectInput, UpdateProjectInput } from "./projects.types";

export class ProjectService {
  constructor(private db: D1Database) {}

  async create(userId: string, data: CreateProjectInput): Promise<DbProject> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, userId, data.name, data.description || null, now, now)
      .run();

    if (!result.success) {
      throw new Error(`Failed to create project: ${result.error}`);
    }

    return {
      id,
      user_id: userId,
      name: data.name,
      description: data.description || null,
      created_at: now,
      updated_at: now,
    };
  }

  async findById(id: string): Promise<DbProject | null> {
    const result = await this.db.prepare(`SELECT * FROM projects WHERE id = ?`).bind(id).first<DbProject>();
    return result || null;
  }

  async findByUserId(
    userId: string,
    limit = 10,
    page = 1,
  ): Promise<{ projects: DbProject[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.db
      .prepare("SELECT COUNT(*) as total FROM projects WHERE user_id = ?")
      .bind(userId)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    const result = await this.db
      .prepare(`SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(userId, limit, offset)
      .all<DbProject>();

    return { projects: result.results, total, page, totalPages };
  }

  async findAll(
    limit = 10,
    page = 1,
  ): Promise<{ projects: (DbProject & { user_name: string })[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.db.prepare("SELECT COUNT(*) as total FROM projects").first<{ total: number }>();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    const result = await this.db
      .prepare(
        `SELECT p.*, u.name as user_name 
         FROM projects p 
         LEFT JOIN users u ON p.user_id = u.id 
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
      )
      .bind(limit, offset)
      .all<DbProject & { user_name: string }>();

    return { projects: result.results, total, page, totalPages };
  }

  async update(id: string, userId: string, data: UpdateProjectInput): Promise<DbProject> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    if (existing.user_id !== userId) {
      throw new Error("Forbidden: Cannot update other users' projects");
    }

    const updated = {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      updated_at: new Date().toISOString(),
    };

    const result = await this.db
      .prepare(`UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?`)
      .bind(updated.name, updated.description, updated.updated_at, id)
      .run();

    if (!result.success) {
      throw new Error(`Failed to update project: ${result.error}`);
    }

    return { ...existing, ...updated };
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    if (existing.user_id !== userId) {
      throw new Error("Forbidden: Cannot delete other users' projects");
    }

    const result = await this.db.prepare(`DELETE FROM projects WHERE id = ?`).bind(id).run();

    if (!result.success) {
      throw new Error(`Failed to delete project: ${result.error}`);
    }
  }
}

export function createProjectService(env: Env): ProjectService {
  return new ProjectService(env.DB);
}
