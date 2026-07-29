import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { updateSettingsSchema } from '../validators/settings.validator';

export async function getSettings(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: vendeurId },
    select: {
      id: true,
      phone: true,
      storeName: true,
      storeSlug: true,
      whatsappBusinessNum: true,
      city: true,
      neighborhood: true,
      logoUrl: true,
      coverUrl: true,
      description: true,
    },
  });
  return res.json({ settings: user });
}

export async function updateSettings(req: AuthRequest, res: Response) {
  const vendeurId = req.user!.id;
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const imageUrl = req.file?.path;
  const uploadTarget = req.query.target as string; // 'logo' | 'cover'

  const user = await prisma.user.update({
    where: { id: vendeurId },
    data: {
      ...parsed.data,
      ...(imageUrl && uploadTarget === 'logo' ? { logoUrl: imageUrl } : {}),
      ...(imageUrl && uploadTarget === 'cover' ? { coverUrl: imageUrl } : {}),
    },
  });

  return res.json({
    settings: {
      id: user.id,
      phone: user.phone,
      storeName: user.storeName,
      storeSlug: user.storeSlug,
      whatsappBusinessNum: user.whatsappBusinessNum,
      city: user.city,
      neighborhood: user.neighborhood,
      logoUrl: user.logoUrl,
      coverUrl: user.coverUrl,
      description: user.description,
    },
  });
}