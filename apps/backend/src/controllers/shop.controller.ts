import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Incrémente le nombre de visites pour une boutique
export const trackShopVisit = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { storeSlug: slug },
      data: {
        visitCount: { increment: 1 },
      },
      select: { visitCount: true },
    });

    return res.status(200).json({
      success: true,
      visitCount: updatedUser.visitCount,
    });
  } catch (error) {
    // Si la boutique n'existe pas ou erreur serveur
    return res.status(404).json({ error: 'Boutique introuvable' });
  }
};