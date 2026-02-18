export { UserRoutes } from "./users/users.route";
export { BlogRoutes } from "./blogs/blogs.route";
export { GenerateBlogRoutes } from "./generate-blog/generate-blog.route";
export { ProjectRoutes } from "./projects/projects.route";

export type { UserRole, BlogStatus, BlogLogAction } from "./types/index";

export type {
  DbUser,
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
  AuthUser,
  LoginResponse,
  PaginatedUsersResponse,
} from "./users/users.types";

export type {
  DbBlog,
  CreateBlogInput,
  UpdateBlogInput,
  BlogResponse,
  PaginatedBlogsResponse,
  BlogLogResponse,
} from "./blogs/blogs.types";

export type { GenerateBlogInput, GenerateBlogResponse } from "./generate-blog/generate-blog.types";

export type {
  DbProject,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectResponse,
  PaginatedProjectsResponse,
} from "./projects/projects.types";
