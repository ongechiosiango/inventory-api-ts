# Inventory API

A full-stack inventory management app built with TypeScript, Express, Redis, and PostgreSQL.

## Stack

- **Backend:** TypeScript, Node.js, Express 5
- **Database:** PostgreSQL (via Prisma ORM)
- **Cache:** Redis (cache-aside with TTL + invalidation)
- **Frontend:** Vanilla HTML/CSS/JS with Font Awesome icons

## Features

- CRUD API for products
- Redis caching with automatic invalidation on write
- Type-safe DB access via Prisma
- Centralized error handling
- Static frontend served from `/public`

## Quick start

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev