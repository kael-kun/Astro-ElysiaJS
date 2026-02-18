export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface PaginatedProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}
