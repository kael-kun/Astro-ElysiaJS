import { createApiKeyService } from "./api-keys.service";
import { createProjectService } from "../projects/projects.service";
import type { ApiKeyResponse, ApiKeyWithFullKey, CreateApiKeyInput } from "./api-keys.types";
import type { AuthUser } from "../users/users.types";

export async function createApiKey(
  projectId: string,
  data: CreateApiKeyInput,
  env: Env,
  authUser: AuthUser,
): Promise<ApiKeyWithFullKey> {
  const projectService = createProjectService(env);
  const project = await projectService.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot manage API keys for other users' projects");
  }

  const apiKeyService = createApiKeyService(env);
  return apiKeyService.create({
    project_id: projectId,
    name: data.name,
  });
}

export async function getApiKeys(projectId: string, env: Env, authUser: AuthUser): Promise<ApiKeyResponse[]> {
  const projectService = createProjectService(env);
  const project = await projectService.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot access other users' projects");
  }

  const apiKeyService = createApiKeyService(env);
  return apiKeyService.findByProjectId(projectId);
}

export async function deleteApiKey(keyId: string, env: Env, authUser: AuthUser): Promise<void> {
  const apiKeyService = createApiKeyService(env);
  const apiKey = await apiKeyService.findById(keyId);

  if (!apiKey) {
    throw new Error("API key not found");
  }

  const projectService = createProjectService(env);
  const project = await projectService.findById(apiKey.project_id);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot delete other users' API keys");
  }

  await apiKeyService.delete(keyId);
}

export async function verifyApiKey(key: string, env: Env): Promise<{ valid: boolean; apiKey: ApiKeyResponse | null }> {
  const apiKeyService = createApiKeyService(env);
  return apiKeyService.verifyKey(key);
}
