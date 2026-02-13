export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "admin" | "client";
  created_at: string;
  updated_at: string;
}

export interface DbBlog {
  id: string;
  user_id: string;
  content: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBlogLog {
  id: string;
  blog_id: string;
  user_id: string;
  action: "created" | "updated" | "published" | "deleted";
  details: string | null;
  created_at: string;
}

// Helper types for queries
export type UserRole = "admin" | "client";
export type BlogStatus = "draft" | "published";
export type BlogLogAction = "created" | "updated" | "published" | "deleted";

// Input types for creating/updating
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: UserRole;
}

export interface CreateBlogInput {
  user_id: string;
  content: string;
  meta_description?: string;
  status?: BlogStatus;
  image_url?: string;
}

export interface UpdateBlogInput {
  id: string;
  content?: string;
  meta_description?: string;
  status?: BlogStatus;
  image_url?: string;
}

export interface CreateBlogLogInput {
  blog_id: string;
  user_id: string;
  action: BlogLogAction;
  details?: string;
}

// Relationships
export interface BlogWithUser extends DbBlog {
  user: DbUser;
}

export interface BlogLogWithDetails extends DbBlogLog {
  user: DbUser;
  blog: DbBlog;
}
