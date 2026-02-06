import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
    workerEntryPoint: {
      path: "src/cloudflare/worker.ts",
    },
  }),
  output: "server",
  env: {
    schema: {
      SECRET_ENVIRONMENT_STATUS: envField.string({ context: "server", access: "public", default: "live" }),
      PUBLIC_GOOGLE_CLIENT_ID: envField.string({ context: "client", access: "public", default: "CHANGE_ME_GOOGLE" }),
      PUBLIC_DEV: envField.string({ context: "client", access: "public", default: "test" }),
      SECRET_DEV: envField.string({ context: "server", access: "secret", default: "test" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["node:buffer"],
    },
    resolve: {
      //@ts-ignore
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
  },
  integrations: [react()],
});
