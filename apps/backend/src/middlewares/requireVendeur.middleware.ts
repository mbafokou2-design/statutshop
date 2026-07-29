import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware : réserve la route aux VENDEURS uniquement.
 * Bloque les SUPER_ADMIN qui n'ont pas de boutique ni de données vendeur.
 * Doit être utilisé après requireAuth.
 */
export function requireVendeur(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'VENDEUR') {
    return res.status(403).json({ error: 'Accès réservé aux vendeurs' });
  }
  next();
}
