import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../services/jwt.service';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // 1. Extraire le token depuis l'en-tête Authorization OU le cookie
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  const token = tokenFromHeader || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    const decoded = verifyToken(token) as JwtPayload;

    // Récupérer l'utilisateur en BDD pour avoir son VRAI rôle actuel
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, phone: true, role: true, storeName: true, isActive: true }
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    if (!dbUser.isActive) {
      return res.status(403).json({ error: 'Votre boutique a été suspendue. Contactez le support.' });
    }

    // Remplace le rôle du token par le VRAI rôle en BDD
    req.user = {
      id: dbUser.id,
      phone: dbUser.phone,
      role: dbUser.role,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}