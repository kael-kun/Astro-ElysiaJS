export type UserRole = "admin" | "client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  blogsCount?: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface UserWithBlogs extends User {
  blogs: BlogPost[];
}
