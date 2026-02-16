import type { Env } from "../types/index";
import type { AuthUser } from "../users/users.types";
import type { GenerateBlogInput } from "./generate-blog.types";
import { generateBlogContent } from "./generate-blog.service";

export async function generateBlog(input: GenerateBlogInput, env: Env): Promise<ReadableStream> {
  return generateBlogContent(input, env);
}
