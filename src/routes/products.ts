import { Router, Request, Response } from "express";
import { db } from "../data/db";
import { redis } from "../redis/client";
import { env } from "../config/env";
import { HttpError } from "../middleware/errorHandler";
import { CreateProductInput, Product, UpdateProductInput } from "../types/product";

export const productsRouter = Router();

const cacheKey = (id: string) => `product:${id}`;

// GET /products — list all (no cache for simplicity)
productsRouter.get("/", async (_req: Request, res: Response) => {
  const products = await db.findAll();
  res.json({ products });
});

// GET /products/:id — cached
productsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const key = cacheKey(id);

  const cached = await redis.get(key);
  if (cached) {
    const product = JSON.parse(cached) as Product;
    res.setHeader("X-Cache", "HIT");
    res.json(product);
    return;
  }

  const product = await db.findById(id);
  if (!product) throw new HttpError(404, `Product ${id} not found`);

  await redis.set(key, JSON.stringify(product), "EX", env.CACHE_TTL_SECONDS);
  res.setHeader("X-Cache", "MISS");
  res.json(product);
});

// POST /products — create
productsRouter.post("/", async (req: Request, res: Response) => {
  const { name, price, stock } = req.body as Partial<CreateProductInput>;

  if (typeof name !== "string" || typeof price !== "number" || typeof stock !== "number") {
    throw new HttpError(400, "name (string), price (number), stock (number) are required");
  }

  const product = await db.create({ name, price, stock });
  res.status(201).json(product);
});

// PUT /products/:id — update + invalidate cache
productsRouter.put("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const patch = req.body as UpdateProductInput;

  const updated = await db.update(id, patch);
  if (!updated) throw new HttpError(404, `Product ${id} not found`);

  // 🔑 Invalidate cache — next GET re-reads from DB
  await redis.del(cacheKey(id));

  res.json(updated);
});

// DELETE /products/:id — delete + invalidate cache
productsRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const existed = await db.delete(id);
  if (!existed) throw new HttpError(404, `Product ${id} not found`);

  await redis.del(cacheKey(id));

  res.status(204).send();
});