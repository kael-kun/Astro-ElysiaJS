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
  title: string | null;
  description: string | null;
  content: string | null;
  meta_description: string | null;
  status: string;
  image_url: string | null;
  view_count?: number;
  created_at: string;
  updated_at: string;
  project_name?: string;
  user_name?: string;
}): BlogResponse {
  return {
    id: blog.id,
    user_id: blog.user_id,
    content: blog.content,
    title: blog.title,
    description: blog.description,
    meta_description: blog.meta_description,
    status: blog.status as BlogResponse["status"],
    image_url: blog.image_url,
    view_count: blog.view_count,
    createdAt: blog.created_at,
    updatedAt: blog.updated_at,
    project_name: blog.project_name,
    user_name: blog.user_name,
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
  limit = 10,
  page = 1,
  status?: string,
  projectId?: string,
): Promise<PaginatedBlogsResponse> {
  const blogService = createBlogService(env);

  let result;
  if (projectId) {
    result = await blogService.findByProjectId(projectId, limit, page, status);
  } else if (authUser.role === "admin") {
    result = await blogService.findAll(limit, page, status);
  } else {
    result = await blogService.findByUserId(authUser.id, limit, page);
  }

  return {
    results: result.blogs.map(toBlogResponse),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
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

  const oldImageUrl = existing.image_url;

  const blog = await blogService.update(id, data);

  if (data.image_url && data.image_url !== oldImageUrl && oldImageUrl) {
    await deleteImageFromR2(oldImageUrl, env);
  }

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

  const imageUrl = existing.image_url;

  await blogService.delete(id);

  if (imageUrl) {
    await deleteImageFromR2(imageUrl, env);
  }

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

/// store imagein r2
export const storeImage = async (image: File, env: Env): Promise<string> => {
  if (!image.type.startsWith("image/")) {
    throw new Error("Only image files allowed");
  }

  const maxSize = 5 * 1024 * 1024;
  if (image.size > maxSize) {
    throw new Error("Image too large (max 5MB)");
  }

  const extension = image.name.split(".").pop();
  const fileName = `blogs/${crypto.randomUUID()}.${extension}`;

  const buffer = await image.arrayBuffer();

  await env.CMS_BUCKET.put(fileName, buffer, {
    httpMetadata: {
      contentType: image.type,
    },
  });

  return fileName;
};

export async function deleteImageFromR2(imageUrl: string, env: Env): Promise<void> {
  if (!imageUrl) return;

  const path = imageUrl.includes("/api/images/") ? imageUrl.substring(imageUrl.indexOf("/api/images/") + 12) : imageUrl;

  try {
    await env.CMS_BUCKET.delete(path);
  } catch (err) {
    console.error("Failed to delete image from R2:", err);
  }
}

export async function recordBlogView(
  blogId: string,
  env: Env,
  ipHash?: string,
  userAgent?: string,
  referer?: string,
): Promise<void> {
  const blogService = createBlogService(env);
  const blog = await blogService.findById(blogId);

  if (!blog || blog.status !== "published") {
    return;
  }

  await blogService.recordView(blogId, ipHash, userAgent, referer);
}
