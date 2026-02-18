export interface DbProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface ProjectResponse {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProjectsResponse {
  projects: ProjectResponse[];
  total: number;
  page: number;
  totalPages: number;
}
