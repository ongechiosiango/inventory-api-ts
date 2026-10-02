import { prisma } from "../db/prisma";
import { Product } from "../types/product";

export const db = {
  async findAll(): Promise<Product[]> {
    const rows = await prisma.products.findMany({ orderBy: { id: "asc" } });
    return rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      price: Number(r.price),
      stock: r.stock,
    }));
  },

  async findById(id: string): Promise<Product | undefined> {
    const row = await prisma.products.findUnique({ where: { id: Number(id) } });
    if (!row) return undefined;
    return {
      id: String(row.id),
      name: row.name,
      price: Number(row.price),
      stock: r.stock,
    };
  },

  async create(input: Omit<Product, "id">): Promise<Product> {
    const row = await prisma.products.create({
      data: {
        name: input.name,
        price: input.price,
        stock: input.stock,
      },
    });
    return {
      id: String(row.id),
      name: row.name,
      price: Number(row.price),
      stock: row.stock,
    };
  },

  async update(
    id: string,
    patch: Partial<Omit<Product, "id">>
  ): Promise<Product | undefined> {
    try {
      const row = await prisma.products.update({
        where: { id: Number(id) },
        data: {
          ...(patch.name !== undefined && { name: patch.name }),
          ...(patch.price !== undefined && { price: patch.price }),
          ...(patch.stock !== undefined && { stock: patch.stock }),
        },
      });
      return {
        id: String(row.id),
        name: row.name,
        price: Number(row.price),
        stock: row.stock,
      };
    } catch {
      return undefined;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.products.delete({ where: { id: Number(id) } });
      return true;
    } catch {
      return false;
    }
  },
};