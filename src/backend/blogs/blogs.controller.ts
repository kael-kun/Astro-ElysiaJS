import type { AuthUser } from "../users/users.types";
import type {
  CreateBlogInput,
  UpdateBlogInput,
  BlogResponse,
  PaginatedBlogsResponse,
  BlogLogResponse,
  CreateBlogLogInput,
} from "./blogs.types";
import { createBlogService } from "./blogs.service";

function toBlogResponse(blog: {
  id: string;
  user_id: string;
  content: string | null;
  meta_description: string | null;
  status: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}): BlogResponse {
  return {
    id: blog.id,
    user_id: blog.user_id,
    content: blog.content,
    meta_description: blog.meta_description,
    status: blog.status as BlogResponse["status"],
    image_url: blog.image_url,
    createdAt: blog.created_at,
    updatedAt: blog.updated_at,
  };
}

function toBlogLogResponse(log: {
  id: string;
  blog_id: string;
  user_id: string;
  action: string;
  details: string | null;
  created_at: string;
}): BlogLogResponse {
  return {
    id: log.id,
    blog_id: log.blog_id,
    user_id: log.user_id,
    action: log.action as BlogLogResponse["action"],
    details: log.details,
    createdAt: log.created_at,
  };
}

export async function createBlog(data: CreateBlogInput, env: Env, authUser: AuthUser): Promise<BlogResponse> {
  if (data.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot create blog for another user");
  }

  const blogService = createBlogService(env);
  const blog = await blogService.create(data);

  await blogService.createLog({
    blog_id: blog.id,
    user_id: authUser.id,
    action: "created",
    details: "Blog created",
  });

  return toBlogResponse(blog);
}

export async function getBlogById(id: string, env: Env, authUser: AuthUser): Promise<BlogResponse> {
  const blogService = createBlogService(env);
  const blog = await blogService.findById(id);

  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot access other users' blogs");
  }

  return toBlogResponse(blog);
}

export async function getBlogs(
  env: Env,
  authUser: AuthUser,
  limit = 50,
  offset = 0,
  status?: string,
): Promise<PaginatedBlogsResponse> {
  const blogService = createBlogService(env);

  let result;
  if (authUser.role === "admin") {
    result = await blogService.findAll(limit, offset, status);
  } else {
    result = await blogService.findByUserId(authUser.id, limit, offset);
  }

  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(result.total / limit);

  return {
    results: result.blogs.map(toBlogResponse),
    total: result.total,
    page,
    totalPages,
  };
}

export async function updateBlog(
  id: string,
  data: UpdateBlogInput,
  env: Env,
  authUser: AuthUser,
): Promise<BlogResponse> {
  const blogService = createBlogService(env);
  const existing = await blogService.findById(id);

  if (!existing) {
    throw new Error("Blog not found");
  }

  if (existing.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot update other users' blogs");
  }

  const blog = await blogService.update(id, data);

  await blogService.createLog({
    blog_id: id,
    user_id: authUser.id,
    action: "updated",
    details: "Blog updated",
  });

  return toBlogResponse(blog);
}

export async function deleteBlog(id: string, env: Env, authUser: AuthUser): Promise<void> {
  const blogService = createBlogService(env);
  const existing = await blogService.findById(id);

  if (!existing) {
    throw new Error("Blog not found");
  }

  if (existing.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot delete other users' blogs");
  }

  await blogService.delete(id);

  await blogService.createLog({
    blog_id: id,
    user_id: authUser.id,
    action: "deleted",
    details: "Blog deleted",
  });
}

export async function publishBlog(id: string, env: Env, authUser: AuthUser): Promise<BlogResponse> {
  const blogService = createBlogService(env);
  const existing = await blogService.findById(id);

  if (!existing) {
    throw new Error("Blog not found");
  }

  if (existing.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot publish other users' blogs");
  }

  const blog = await blogService.update(id, { status: "published" });

  await blogService.createLog({
    blog_id: id,
    user_id: authUser.id,
    action: "published",
    details: "Blog published",
  });

  return toBlogResponse(blog);
}

export async function getBlogLogs(blogId: string, env: Env, authUser: AuthUser): Promise<BlogLogResponse[]> {
  const blogService = createBlogService(env);
  const blog = await blogService.findById(blogId);

  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot access other users' blog logs");
  }

  const logs = await blogService.findLogsByBlogId(blogId);
  return logs.map(toBlogLogResponse);
}
