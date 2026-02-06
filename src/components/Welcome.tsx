import { PUBLIC_DEV } from "astro:env/client";

export function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-green-800">Welcome to React Component</h1>
      <p className="text-gray-600 mt-2">Environment: {PUBLIC_DEV}</p>
    </div>
  );
}
