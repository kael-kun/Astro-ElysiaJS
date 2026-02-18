# Elysia with Bun runtime

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
bun create elysia ./elysia-example
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

---

---

1️⃣ Run Schema on Local Database

Apply your schema.sql file to the local D1 database:

## npx wrangler d1 execute cms-database --local --file=schema.sql

Check the tables in your local database:

## npx wrangler d1 execute cms-database --command="SELECT name FROM sqlite_master WHERE type='table';"

---

2️⃣ Run Schema on Remote Database

Apply your schema.sql to the remote D1 database on Cloudflare:

## npx wrangler d1 execute cms-database --remote --file=schema.sql

Check the tables in the remote database:

## npx wrangler d1 execute cms-database --remote --command="SELECT name FROM sqlite_master WHERE type='table';"

---
