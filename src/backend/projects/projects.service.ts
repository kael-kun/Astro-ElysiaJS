import type { D1Database } from "@cloudflare/workers-types";
import type { DbProject, CreateProjectInput, UpdateProjectInput } from "./projects.types";

const VALIDATION = {
  name: { minLength: 1, maxLength: 100 },
  description: { maxLength: 500 },
};

export class ProjectService {
  constructor(private db: D1Database) {}

  private validateName(name: string): void {
    if (!name || !name.trim()) {
      throw new Error("Project name is required");
    }
    if (name.length > VALIDATION.name.maxLength) {
      throw new Error(`Project name must be ${VALIDATION.name.maxLength} characters or less`);
    }
  }

  private validateDescription(description: string | undefined): void {
    if (description && description.length > VALIDATION.description.maxLength) {
      throw new Error(`Description must be ${VALIDATION.description.maxLength} characters or less`);
    }
  }

  async create(userId: string, data: CreateProjectInput): Promise<DbProject> {
    this.validateName(data.name);
    this.validateDescription(data.description);
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

  async getProjectCountByUserId(userId: string): Promise<number> {
    const countResult = await this.db
      .prepare("SELECT COUNT(*) as total FROM projects WHERE user_id = ?")
      .bind(userId)
      .first<{ total: number }>();
    return countResult?.total ?? 0;
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

  async update(id: string, data: UpdateProjectInput): Promise<DbProject> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    if (data.name !== undefined) {
      this.validateName(data.name);
    }
    if (data.description !== undefined) {
      this.validateDescription(data.description);
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

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const result = await this.db.prepare(`DELETE FROM projects WHERE id = ?`).bind(id).run();

    if (!result.success) {
      throw new Error(`Failed to delete project: ${result.error}`);
    }
  }

  async createActivityLog(
    userId: string,
    entityType: "blog" | "project" | "user",
    entityId: string,
    entityName: string,
    action: "created" | "updated" | "deleted",
    details?: string,
  ): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO activity_logs (id, user_id, entity_type, entity_id, entity_name, action, details, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, userId, entityType, entityId, entityName, action, details || null, now)
      .run();
  }
}

export function createProjectService(env: Env): ProjectService {
  return new ProjectService(env.DB);
}
