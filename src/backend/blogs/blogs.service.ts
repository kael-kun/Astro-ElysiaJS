import type { D1Database } from "@cloudflare/workers-types";
import type { DbBlog, CreateBlogInput, UpdateBlogInput, DbBlogLog, CreateBlogLogInput } from "./blogs.types";

export class BlogService {
  constructor(private db: D1Database) {}

  async create(data: CreateBlogInput): Promise<DbBlog> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Handle image - convert File to string URL or store directly
    let imageUrl: string | null = null;
    if (data.image) {
      // For now, we'll just store the file name or a placeholder
      // In production, you'd upload to R2/storage and get a URL
      imageUrl = typeof data.image === "string" ? data.image : null;
    }

    const result = await this.db
      .prepare(
        `INSERT INTO blogs (id, user_id, title, description, content, meta_description, status, image_url, project_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      created_at: now,
      updated_at: now,
    };
  }

  async findById(id: string): Promise<DbBlog | null> {
    const result = await this.db.prepare(`SELECT * FROM blogs WHERE id = ?`).bind(id).first<DbBlog>();
    return result || null;
  }

  async findByUserId(userId: string, limit = 50, offset = 0): Promise<{ blogs: DbBlog[]; total: number }> {
    const countResult = await this.db
      .prepare("SELECT COUNT(*) as total FROM blogs WHERE user_id = ?")
      .bind(userId)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;

    const result = await this.db
      .prepare(`SELECT * FROM blogs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(userId, limit, offset)
      .all<DbBlog>();

    return { blogs: result.results, total };
  }

  async findAll(limit = 50, offset = 0, status?: string): Promise<{ blogs: DbBlog[]; total: number }> {
    let query = "SELECT COUNT(*) as total FROM blogs";
    const params: (string | number)[] = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    const countResult = await this.db
      .prepare(query)
      .bind(...params)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;

    let selectQuery = "SELECT * FROM blogs";
    if (status) {
      selectQuery += " WHERE status = ?";
    }
    selectQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const result = await this.db
      .prepare(selectQuery)
      .bind(...params)
      .all<DbBlog>();

    return { blogs: result.results, total };
  }

  async findByProjectId(
    projectId: string,
    limit = 50,
    offset = 0,
    status?: string,
  ): Promise<{ blogs: DbBlog[]; total: number }> {
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

    let selectQuery = "SELECT * FROM blogs WHERE project_id = ?";
    const selectParams: (string | number)[] = [projectId];

    if (status) {
      selectQuery += " AND status = ?";
      selectParams.push(status);
    }
    selectQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    selectParams.push(limit, offset);

    const result = await this.db
      .prepare(selectQuery)
      .bind(...selectParams)
      .all<DbBlog>();

    return { blogs: result.results, total };
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
    // First delete related blog_logs
    await this.db.prepare("DELETE FROM blog_logs WHERE blog_id = ?").bind(id).run();

    // Then delete the blog
    const result = await this.db.prepare(`DELETE FROM blogs WHERE id = ?`).bind(id).run();

    if (!result.success) {
      throw new Error(`Failed to delete blog: ${result.error}`);
    }
  }

  async createLog(data: CreateBlogLogInput): Promise<DbBlogLog> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const result = await this.db
      .prepare(
        `INSERT INTO blog_logs (id, blog_id, user_id, action, details, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, data.blog_id, data.user_id, data.action, data.details || null, now)
      .run();

    if (!result.success) {
      throw new Error(`Failed to create blog log: ${result.error}`);
    }

    return {
      id,
      blog_id: data.blog_id,
      user_id: data.user_id,
      action: data.action,
      details: data.details || null,
      created_at: now,
    };
  }

  async findLogsByBlogId(blogId: string): Promise<DbBlogLog[]> {
    const result = await this.db
      .prepare(`SELECT * FROM blog_logs WHERE blog_id = ? ORDER BY created_at DESC`)
      .bind(blogId)
      .all<DbBlogLog>();

    return result.results;
  }
}

export function createBlogService(env: Env): BlogService {
  return new BlogService(env.DB);
}
