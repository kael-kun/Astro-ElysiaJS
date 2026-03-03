import { defineMiddleware } from "astro/middleware";

const PROTECTED_ROUTES = ["/dashboard"];
const PUBLIC_ROUTES = ["/auth/login", "/api", "/_"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  console.log("=== MIDDLEWARE DEBUG ===");
  console.log("Pathname:", pathname);

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  console.log("Is protected:", isProtectedRoute);
  console.log("Is public:", isPublicRoute);

  if (!isProtectedRoute || isPublicRoute) {
    console.log("Skipping - not protected or is public");
    return next();
  }

  const token = cookies.get("auth_token")?.value;
  console.log("Cookie token:", token ? "exists" : "NOT FOUND");

  if (!token) {
    console.log("No token - redirecting to /auth/login");
    return redirect("/auth/login", 302);
  }

  console.log("Has token - allowing access");
  return next();
});
