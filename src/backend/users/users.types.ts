import type { UserRole } from "../types/index";

export type { UserRole };
export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: UserRole;
  password?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  total: number;
}
