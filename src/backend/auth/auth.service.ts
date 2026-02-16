import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { hashPassword, verifyPassword } from "src/lib/hashpassword";
import type { AuthUser, UserRole } from "../users/users.types";

export interface TokenPayload extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
}

export async function createToken(payload: AuthUser, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const secretKeyBytes = encoder.encode(secretKey);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setSubject(payload.id)
    .sign(secretKeyBytes);
}

export async function verifyToken(token: string, secretKey: string): Promise<AuthUser | null> {
  try {
    const encoder = new TextEncoder();
    const secretKeyBytes = encoder.encode(secretKey);

    const { payload } = await jwtVerify(token, secretKeyBytes, {
      algorithms: ["HS256"],
    });

    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export function parseAuthHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

export async function hashPasswordValue(password: string): Promise<string> {
  return hashPassword(password);
}

export async function validatePassword(password: string, hash: string): Promise<boolean> {
  return verifyPassword(password, hash);
}

export async function authenticateUser(
  email: string,
  password: string,
  userService: { findByEmail(email: string): Promise<{ id: string; email: string; name: string; role: string; password_hash: string } | null> },
  secretKey: string,
): Promise<{ user: AuthUser; token: string } | null> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await userService.findByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const token = await createToken(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    },
    secretKey,
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    },
    token,
  };
}
