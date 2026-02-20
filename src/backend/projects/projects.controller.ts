import type { AuthUser } from "../users/users.types";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectResponse,
  PaginatedProjectsResponse,
} from "./projects.types";
import { createProjectService } from "./projects.service";

function toProjectResponse(project: {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
}): ProjectResponse {
  return {
    id: project.id,
    user_id: project.user_id,
    name: project.name,
    description: project.description,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    user_name: project.user_name,
  };
}

export async function getProjects(
  env: Env,
  authUser: AuthUser,
  limit = 10,
  page = 1,
): Promise<PaginatedProjectsResponse> {
  const projectService = createProjectService(env);

  let result;
  if (authUser.role === "admin") {
    result = await projectService.findAll(limit, page);
    return {
      projects: result.projects.map((p) => toProjectResponse(p)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }

  const { projects, total, totalPages } = await projectService.findByUserId(authUser.id, limit, page);

  return {
    projects: projects.map(toProjectResponse),
    total,
    page,
    totalPages,
  };
}

export async function getProjectById(id: string, env: Env, authUser: AuthUser): Promise<ProjectResponse> {
  const projectService = createProjectService(env);
  const project = await projectService.findById(id);

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.user_id !== authUser.id && authUser.role !== "admin") {
    throw new Error("Forbidden: Cannot access other users' projects");
  }

  return toProjectResponse(project);
}

export async function createProject(data: CreateProjectInput, env: Env, authUser: AuthUser): Promise<ProjectResponse> {
  if (!data.name?.trim()) {
    throw new Error("Project name is required");
  }

  const projectService = createProjectService(env);
  const project = await projectService.create(authUser.id, data);

  return toProjectResponse(project);
}

export async function updateProject(
  id: string,
  data: UpdateProjectInput,
  env: Env,
  authUser: AuthUser,
): Promise<ProjectResponse> {
  const projectService = createProjectService(env);
  const project = await projectService.update(id, authUser.id, data);

  return toProjectResponse(project);
}

export async function deleteProject(id: string, env: Env, authUser: AuthUser): Promise<void> {
  const projectService = createProjectService(env);
  await projectService.delete(id, authUser.id);
}
