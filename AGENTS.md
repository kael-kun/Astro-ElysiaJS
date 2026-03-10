# AGENTS.md - Development Guidelines for Astro-ElysiaJS

## Project Overview

This is an Astro + React + ElysiaJS project with Cloudflare Pages adapter. It uses TypeScript with strict type checking, TailwindCSS for styling, and follows a component-based architecture.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run check` | Run Astro type checking |
| `npm run build` | Run type check + production build |
| `npm run preview` | Preview production build locally |
| `npm run deploy-staging` | Deploy to Cloudflare staging environment |
| `npm run deploy-production` | Deploy to Cloudflare production environment |
| `npm run wrangler-types` | Generate Cloudflare Worker types |

## Running a Single Test

No test framework is currently configured. To add tests, install Vitest or Bun's built-in test runner:

```bash
# With Bun (already in devDependencies)
bun test

# Or with Vitest
npm install -D vitest
```

## Code Style Guidelines

### TypeScript

- Strict mode is enabled in `tsconfig.json`
- Use explicit types for function parameters and return values
- Avoid `any` - use `unknown` when type is truly unknown
- Use `interface` for object shapes, `type` for unions/intersections

### React Components

- Use functional components with TypeScript
- Use `memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for callback functions passed to children
- Use named exports for components
- Follow PascalCase for component file names and exports

```typescript
// Good
export const Button = memo<ButtonProps>(({ children, ...props }) => {
  return <button {...props}>{children}</button>;
});
Button.displayName = "Button";

// Avoid
const button = ({ children }) => <button>{children}</button>;
export default button;
```

### Imports

- Use absolute imports from `src/` root where possible
- Group imports in this order: external libs, internal modules, types
- Use barrel exports (`index.ts`) for clean public APIs

```typescript
// Good
import { useState, useEffect, memo } from "react";
import type { User } from "../types/user";
import { apiClient } from "../services/apiClient";
import { Button } from "../components/ui/Button";

// Barrel export example (src/components/ui/index.ts)
export { Button } from "./Button";
export { Input } from "./Input";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserTable.tsx`, `DashboardLayout.tsx` |
| Hooks | camelCase starting with `use` | `useForm.ts`, `useAuth.ts` |
| Types/Interfaces | PascalCase | `UserProps`, `ApiResponse` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| Variables/Functions | camelCase | `getUserData`, `isLoading` |
| Files (utilities) | camelCase | `fetchClient.ts`, `apiClient.ts` |

### Error Handling

- Always handle async errors with try/catch
- Use proper error types and error boundaries in React
- Log errors appropriately (console.error for client, proper logging for server)

```typescript
// Client-side
try {
  const data = await apiClient.get("/users");
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.message);
  }
  throw error;
}

// Server-side (Elysia)
app.get("/api/users", async ({ error }) => {
  try {
    return await fetchUsers();
  } catch (e) {
    return error(500, { message: "Failed to fetch users" });
  }
});
```

### Environment Variables

- Use Astro's built-in `envField` in `astro.config.mjs` for type-safe env vars
- Public variables: `PUBLIC_*` prefix
- Secret variables: No prefix (server-only)

```typescript
// astro.config.mjs
env: {
  schema: {
    SECRET_API_KEY: envField.string({ context: "server", access: "secret" }),
    PUBLIC_APP_URL: envField.string({ context: "client", access: "public" }),
  },
}

// Usage
import { SECRET_API_KEY, PUBLIC_APP_URL } from "astro:env";
```

### File Organization

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── auth/        # Authentication components
│   └── blog/        # Blog-related components
├── pages/           # Astro pages
│   ├── api/         # API routes
│   └── dashboard/   # Dashboard pages
├── routes/          # Elysia route definitions
├── services/        # API clients, utilities
├── hooks/           # Custom React hooks
├── providers/       # React context providers
├── types/           # TypeScript type definitions
├── layouts/         # Astro layouts
└── styles/          # Global CSS
```

### Styling

- Use TailwindCSS utility classes
- Keep component styles co-located with components
- Use CSS custom properties for theme values in `global.css`

### Astro Specific

- Use `.astro` files for layouts and pages
- Use server output mode (`output: "server"`) with Cloudflare adapter
- Define types in frontmatter for page props
- Use `astro:env` for type-safe environment variables

### Linting

No ESLint or Prettier is currently configured. Consider adding:

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier prettier-plugin-astro
```

## API Patterns

### Client-Side (Axios)

- Use `apiClient.ts` singleton with interceptors
- Handle 401 (unauthorized) globally - redirect to login
- Handle 403 (forbidden) and 500 (server errors) appropriately

### Server-Side (ElysiaJS)

- Define routes in `src/routes/`
- Use OpenAPI annotations with `@elysiajs/openapi`
- Return proper HTTP status codes
- Validate input with Elysia decorators

## Git Conventions

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Keep commits atomic and focused
- Run `npm run check` before committing
