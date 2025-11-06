import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "/app/node_modules/prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});