import { defineConfig, envField } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

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
    },
  },
  vite: {
    ssr: {
      external: ["node:buffer"]
    },
    resolve: {
      //@ts-ignore
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge"
      }
    }
  }
});
