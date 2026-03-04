import type { D1Database } from "@cloudflare/workers-types";
import type { DbBlog, CreateBlogInput, UpdateBlogInput, DbBlogView } from "./blogs.types";

export interface BlogWithRelations extends DbBlog {
  project_name?: string;
  user_name?: string;
}

export class BlogService {
  constructor(private db: D1Database) {}

  async create(data: CreateBlogInput): Promise<DbBlog> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    let imageUrl: string | null = null;
    if (data.image) {
      imageUrl = typeof data.image === "string" ? data.image : null;
    }

    const result = await this.db
      .prepare(
        `INSERT INTO blogs (id, user_id, title, description, content, meta_description, status, image_url, project_id, view_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        data.user_id,
        data.title || null,
        data.description || null,
        data.content,
        data.meta_description || null,
        data.status || "draft",
        imageUrl,
        data.project_id || null,
        0,
        now,
        now,
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to create blog: ${result.error}`);
    }

    return {
      id,
      user_id: data.user_id,
      title: data.title || null,
      description: data.description || null,
      content: data.content,
      meta_description: data.meta_description || null,
      status: data.status || "draft",
      image_url: imageUrl,
      project_id: data.project_id || null,
      view_count: 0,
      created_at: now,
      updated_at: now,
    };
  }

  async findById(id: string): Promise<DbBlog | null> {
    const result = await this.db.prepare(`SELECT * FROM blogs WHERE id = ?`).bind(id).first<DbBlog>();
    return result || null;
  }

  async findByUserId(userId: string, limit = 10, page = 1): Promise<{ blogs: BlogWithRelations[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const countResult = await this.db
      .prepare("SELECT COUNT(*) as total FROM blogs WHERE user_id = ?")
      .bind(userId)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    const result = await this.db
      .prepare(
        `SELECT b.*, u.name as user_name FROM blogs b LEFT JOIN users u ON b.user_id = u.id WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      )
      .bind(userId, limit, offset)
      .all<BlogWithRelations>();

    return { blogs: result.results, total, page, totalPages };
  }

  async findAll(limit = 10, page = 1, status?: string): Promise<{ blogs: BlogWithRelations[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    let countQuery = "SELECT COUNT(*) as total FROM blogs";
    const params: (string | number)[] = [];

    if (status) {
      countQuery += " WHERE status = ?";
      params.push(status);
    }

    const countResult = await this.db
      .prepare(countQuery)
      .bind(...params)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    let selectQuery = `SELECT b.*, p.name as project_name, u.name as user_name 
                       FROM blogs b 
                       LEFT JOIN projects p ON b.project_id = p.id 
                       LEFT JOIN users u ON b.user_id = u.id`;
    if (status) {
      selectQuery += " WHERE b.status = ?";
    }
    selectQuery += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const result = await this.db
      .prepare(selectQuery)
      .bind(...params)
      .all<BlogWithRelations>();

    return { blogs: result.results, total, page, totalPages };
  }

  async findByProjectId(
    projectId: string,
    limit = 10,
    page = 1,
    status?: string,
  ): Promise<{ blogs: BlogWithRelations[]; total: number; page: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    let countQuery = "SELECT COUNT(*) as total FROM blogs WHERE project_id = ?";
    const countParams: (string | number)[] = [projectId];

    if (status) {
      countQuery += " AND status = ?";
      countParams.push(status);
    }

    const countResult = await this.db
      .prepare(countQuery)
      .bind(...countParams)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    let selectQuery =
      "SELECT b.*, u.name as user_name FROM blogs b LEFT JOIN users u ON b.user_id = u.id WHERE b.project_id = ?";
    const selectParams: (string | number)[] = [projectId];

    if (status) {
      selectQuery += " AND b.status = ?";
      selectParams.push(status);
    }
    selectQuery += " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
    selectParams.push(limit, offset);

    const result = await this.db
      .prepare(selectQuery)
      .bind(...selectParams)
      .all<BlogWithRelations>();

    return { blogs: result.results, total, page, totalPages };
  }

  async update(id: string, data: UpdateBlogInput): Promise<DbBlog> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Blog not found");
    }

    const updated = {
      ...existing,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      content: data.content ?? existing.content,
      meta_description: data.meta_description ?? existing.meta_description,
      status: data.status ?? existing.status,
      image_url: data.image_url ?? existing.image_url,
      updated_at: new Date().toISOString(),
    };

    const result = await this.db
      .prepare(
        `UPDATE blogs SET title = ?, description = ?, content = ?, meta_description = ?, status = ?, image_url = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(
        updated.title ?? existing.title,
        updated.description ?? existing.description,
        updated.content,
        updated.meta_description,
        updated.status,
        updated.image_url,
        updated.updated_at,
        id,
      )
      .run();

    if (!result.success) {
      throw new Error(`Failed to update blog: ${result.error}`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.prepare(`DELETE FROM blogs WHERE id = ?`).bind(id).run();

    if (!result.success) {
      throw new Error(`Failed to delete blog: ${result.error}`);
    }
  }

  async recordView(blogId: string, ipHash?: string, userAgent?: string, referer?: string): Promise<void> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO blog_views (id, blog_id, ip_hash, user_agent, referer, viewed_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, blogId, ipHash || null, userAgent || null, referer || null, now)
      .run();

    await this.db.prepare(`UPDATE blogs SET view_count = view_count + 1 WHERE id = ?`).bind(blogId).run();
  }

  async getViewCount(blogId: string): Promise<number> {
    const result = await this.db.prepare(`SELECT view_count FROM blogs WHERE id = ?`).bind(blogId).first<{ view_count: number }>();
    return result?.view_count ?? 0;
  }

  async findViewsByBlogId(blogId: string, limit = 100): Promise<DbBlogView[]> {
    const result = await this.db
      .prepare(`SELECT * FROM blog_views WHERE blog_id = ? ORDER BY viewed_at DESC LIMIT ?`)
      .bind(blogId, limit)
      .all<DbBlogView>();

    return result.results;
  }

  async getTotalViews(): Promise<{ total: number }> {
    const result = await this.db.prepare(`SELECT COALESCE(SUM(view_count), 0) as total FROM blogs`).first<{ total: number }>();
    return { total: result?.total ?? 0 };
  }

  async getTotalViewsByUserId(userId: string): Promise<{ total: number }> {
    const result = await this.db
      .prepare(`SELECT COALESCE(SUM(view_count), 0) as total FROM blogs WHERE user_id = ?`)
      .bind(userId)
      .first<{ total: number }>();
    return { total: result?.total ?? 0 };
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

  async getPublishedCountByUserId(userId: string): Promise<{ total: number }> {
    const result = await this.db
      .prepare(`SELECT COUNT(*) as total FROM blogs WHERE user_id = ? AND status = ?`)
      .bind(userId, "published")
      .first<{ total: number }>();
    return { total: result?.total ?? 0 };
  }

  async getPublishedCount(): Promise<{ total: number }> {
    const result = await this.db
      .prepare(`SELECT COUNT(*) as total FROM blogs WHERE status = ?`)
      .bind("published")
      .first<{ total: number }>();
    return { total: result?.total ?? 0 };
  }
}

export function createBlogService(env: Env): BlogService {
  return new BlogService(env.DB);
}
