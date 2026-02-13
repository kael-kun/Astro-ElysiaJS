import type { Database } from "src/services/database";
import type { DbUser, CreateUserInput, UpdateUserInput } from "src/types/database";
import { hashPassword, verifyPassword } from "src/lib/hashpassword";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "client";
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: "admin" | "client";
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }
  return { valid: true };
}

function parseJwt(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function createJwt(payload: AuthUser): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const data = btoa(JSON.stringify(payload));
  const signature = btoa(payload.role);
  return `${header}.${data}.${signature}`;
}

function toUserResponse(user: DbUser): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

export async function loginUser(
  email: string,
  password: string,
  db: Database
): Promise<{ user: DbUser; token: string }> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!validateEmail(email)) {
    throw new Error("Invalid email format");
  }

  const user = await db.users.findByEmail(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const token = createJwt({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { user, token };
}

export async function getUsers(
  db: Database,
  userData: AuthUser
): Promise<UserResponse[]> {
  if (userData.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  const users = await db.users.findAll();
  return users.map(toUserResponse);
}

export async function getUserById(
  id: string,
  db: Database,
  userData: AuthUser
): Promise<UserResponse> {
  const user = await db.users.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (userData.role !== "admin" && userData.id !== user.id) {
    throw new Error("Forbidden: Cannot access other users");
  }

  return toUserResponse(user);
}

export async function createUser(
  data: CreateUserData,
  db: Database,
  userData: AuthUser
): Promise<UserResponse> {
  if (userData.role !== "admin") {
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

  const existingUser = await db.users.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await db.users.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: data.role || "client",
  });

  return toUserResponse(user);
}

export async function updateUser(
  id: string,
  data: UpdateUserData,
  db: Database,
  userData: AuthUser
): Promise<UserResponse> {
  if (data.email && !validateEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  if (data.role && !["admin", "client"].includes(data.role)) {
    throw new Error("Role must be either 'admin' or 'client'");
  }

  const existingUser = await db.users.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (userData.role !== "admin" && userData.id !== existingUser.id) {
    throw new Error("Forbidden: Cannot update other users");
  }

  if (data.email && data.email !== existingUser.email) {
    const emailExists = await db.users.findByEmail(data.email);
    if (emailExists) {
      throw new Error("Email already exists");
    }
  }

  const updateData: UpdateUserInput = {};
  if (data.email) updateData.email = data.email;
  if (data.name) updateData.name = data.name;
  if (userData.role === "admin" && data.role) updateData.role = data.role;

  const user = await db.users.update(id, updateData);
  return toUserResponse(user);
}

export async function deleteUser(
  id: string,
  db: Database,
  userData: AuthUser
): Promise<void> {
  if (userData.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  const existingUser = await db.users.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  await db.users.delete(id);
}

export function parseAuthToken(authHeader: string | undefined): AuthUser | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return parseJwt(token);
}

export { validateEmail, validatePassword };
