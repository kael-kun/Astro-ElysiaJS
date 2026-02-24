import type { AuthUser, CreateUserInput, UpdateUserInput, UserResponse, PaginatedUsersResponse } from "./users.types";
import { createUserService } from "./users.service";
import { authenticateUser, hashPasswordValue } from "../auth/auth.service";

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  return { valid: true };
}

function toUserResponse(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserResponse["role"],
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function loginUser(
  email: string,
  password: string,
  env: Env,
): Promise<{ token: string; user: UserResponse }> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!validateEmail(email)) {
    throw new Error("Invalid email format");
  }

  const userService = createUserService(env);
  const result = await authenticateUser(email, password, userService, env.JWT_SECRET as string);

  if (!result) {
    throw new Error("Invalid email or password");
  }

  const dbUser = await userService.findById(result.user.id);
  if (!dbUser) {
    throw new Error("User not found");
  }

  return {
    token: result.token,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    },
  };
}

export async function getUsers(env: Env, authUser: AuthUser, limit = 10, page = 1): Promise<PaginatedUsersResponse> {
  if (authUser.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  const userService = createUserService(env);
  const { users, total, totalPages } = await userService.findAll(limit, page);

  return {
    users: users.map(toUserResponse),
    total,
    page,
    totalPages,
  };
}

export async function getUserById(id: string, env: Env, authUser: AuthUser): Promise<UserResponse> {
  const userService = createUserService(env);
  const user = await userService.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (authUser.role !== "admin" && authUser.id !== user.id) {
    throw new Error("Forbidden: Cannot access other users");
  }

  return toUserResponse(user);
}

export async function createUserForTesting(data: CreateUserInput, env: Env): Promise<UserResponse> {
  if (!data.email || !data.password || !data.name) {
    throw new Error("Email, password, and name are required");
  }

  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }

  if (data.role && !["admin", "client"].includes(data.role)) {
    throw new Error("Role must be either 'admin' or 'client'");
  }

  const userService = createUserService(env);
  const existingUser = await userService.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPasswordValue(data.password);

  const user = await userService.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: data.role,
  });

  return toUserResponse(user);
}

export async function createUser(data: CreateUserInput, env: Env, authUser: AuthUser): Promise<UserResponse> {
  if (authUser.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  if (!data.email || !data.password || !data.name) {
    throw new Error("Email, password, and name are required");
  }

  if (!validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message);
  }

  if (data.role && !["admin", "client"].includes(data.role)) {
    throw new Error("Role must be either 'admin' or 'client'");
  }

  const userService = createUserService(env);
  const existingUser = await userService.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPasswordValue(data.password);

  const user = await userService.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: data.role,
  });

  return toUserResponse(user);
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
  env: Env,
  authUser: AuthUser,
): Promise<UserResponse> {
  if (data.email && !validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  if (data.role && !["admin", "client"].includes(data.role)) {
    throw new Error("Role must be either 'admin' or 'client'");
  }

  if (data.password) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }
  }

  const userService = createUserService(env);
  const existingUser = await userService.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (authUser.role !== "admin" && authUser.id !== existingUser.id) {
    throw new Error("Forbidden: Cannot update other users");
  }

  if (data.email && data.email !== existingUser.email) {
    const emailExists = await userService.findByEmail(data.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  const updateData: UpdateUserInput = {};
  if (data.email) updateData.email = data.email;
  if (data.name) updateData.name = data.name;
  if (data.password) {
    updateData.password = await hashPasswordValue(data.password);
  }
  if (authUser.role === "admin" && data.role) updateData.role = data.role;

  const user = await userService.update(id, updateData);
  return toUserResponse(user);
}

export async function deleteUser(id: string, env: Env, authUser: AuthUser): Promise<void> {
  if (authUser.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  const userService = createUserService(env);
  const existingUser = await userService.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  await userService.delete(id);
}

export async function parseAuthToken(authHeader: string | undefined, env: Env): Promise<AuthUser | null> {
  const { verifyToken, parseAuthHeader } = await import("../auth/auth.service");
  const token = parseAuthHeader(authHeader);
  if (!token) return null;
  return verifyToken(token, env.JWT_SECRET as string);
}
