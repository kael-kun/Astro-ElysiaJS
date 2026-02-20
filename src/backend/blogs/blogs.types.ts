import type { BlogStatus, BlogLogAction } from "../types/index";

export interface DbBlog {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  meta_description: string | null;
  status: BlogStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBlogLog {
  id: string;
  blog_id: string;
  user_id: string;
  action: BlogLogAction;
  details: string | null;
  created_at: string;
}

export interface CreateBlogInput {
  user_id: string;
  title?: string;
  description?: string;
  content: string;
  meta_description?: string;
  status?: BlogStatus;
  image?: File | null;
  project_id?: string;
}

export interface UpdateBlogInput {
  title?: string;
  description?: string;
  content?: string;
  meta_description?: string;
  status?: BlogStatus;
  image_url?: string;
}

export interface BlogResponse {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  meta_description: string | null;
  status: BlogStatus;
  image_url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogWithUser extends BlogResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PaginatedBlogsResponse {
  results: BlogResponse[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateBlogLogInput {
  blog_id: string;
  user_id: string;
  action: BlogLogAction;
  details?: string;
}

export interface BlogLogResponse {
  id: string;
  blog_id: string;
  user_id: string;
  action: BlogLogAction;
  details: string | null;
  createdAt: string;
}
