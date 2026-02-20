import type { AuthUser } from "../users/users.types";
import type { GenerateBlogInput } from "./generate-blog.types";
import { generateBlogContent, generateBlogMetadata, type BlogMetadata } from "./generate-blog.service";

export async function generateBlog(input: GenerateBlogInput, env: Env, _authUser: AuthUser): Promise<ReadableStream> {
  return generateBlogContent(input, env);
}

export async function generateMetadata(input: GenerateBlogInput, env: Env): Promise<BlogMetadata> {
  return generateBlogMetadata(input, env);
}
