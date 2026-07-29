import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { slugify } from '../lib/slugify';

async function generateUniqueSlug(vendeurId: string, title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: { vendeurId, slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function createProduct(req: AuthRequest, res: Response) {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const vendeurId = req.user!.id;
  const imageUrl = (req.file as any)?.path || null;
  const slug = await generateUniqueSlug(vendeurId, parsed.data.title);

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      vendeurId,
      slug,
      imageUrl,
    },
  });

  return res.status(201).json({ product });
}

export async function getProducts(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;

  const products = await prisma.product.findMany({
    where: { vendeurId },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ products });
}

export async function getProductById(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: { id, vendeurId },
  });

  if (!product) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  return res.json({ product });
}

export async function updateProduct(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const { id } = req.params;

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const existing = await prisma.product.findFirst({ where: { id, vendeurId } });
  if (!existing) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  const imageUrl = (req.file as any)?.path;

  // Régénère le slug uniquement si le titre change
  const slug = parsed.data.title
    ? await generateUniqueSlug(vendeurId, parsed.data.title, id)
    : undefined;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(slug ? { slug } : {}),
      ...(imageUrl ? { imageUrl } : {}),
    },
  });

  return res.json({ product });
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.product.findFirst({ where: { id, vendeurId } });
  if (!existing) {
    return res.status(404).json({ error: 'Produit introuvable' });
  }

  await prisma.product.delete({ where: { id } });

  return res.json({ message: 'Produit supprimé' });
}