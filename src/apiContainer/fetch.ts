import { SECRET_DEV } from "astro:env/server";
export function SecretDev() {
  return SECRET_DEV;
}
