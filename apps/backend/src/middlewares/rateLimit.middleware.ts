import rateLimit from 'express-rate-limit';

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 demandes max par IP+numéro dans la fenêtre
  message: { error: 'Trop de demandes de code. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}-${req.body?.phone || 'unknown'}`;
  },
});