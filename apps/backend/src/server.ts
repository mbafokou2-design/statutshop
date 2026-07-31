import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import publicShopRoutes from './routes/publicShop.routes';
import { bot } from './services/telegramBot.service';
import { restoreWhatsAppSessions } from './services/baileys.service';
import settingsRoutes from './routes/settings.routes';
import deliveryPartnerRoutes from './routes/deliveryPartner.routes';
import analyticsRoutes from './routes/analytics.routes';
import financeRoutes from './routes/finance.routes';
import orderRoutes from './routes/order.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import adminRoutes from './routes/admin.routes';
import deliveryCandidateRoutes from './routes/deliveryCandidate.routes';

import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser requests sans origin (ex: mobile, postman) ou localhost / production domain
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Logger simple pour voir passer toutes les requêtes dans le terminal
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes API
app.use('/api/v1/shop', publicShopRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/delivery-partners', deliveryPartnerRoutes);
app.use('/api/v1/analytics', analyticsRoutes); // Pour Google Analytics / Trafic web
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);    // Pour les données financières & bénéfices
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/delivery-candidates', deliveryCandidateRoutes);

app.post('/api/v1/telegram-webhook', (req, res) => {
  if (bot) {
    bot.processUpdate(req.body);
  }
  res.sendStatus(200);
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'StatutShop API is running' });
});

app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`✅ StatutShop backend running on http://localhost:${PORT}`);
  console.log(`==================================================`);

  // 1. Vérification connexion Base de données Prisma Neon
  try {
    const userCount = await prisma.user.count();
    console.log(`[Database]  🟢 Connexion Neon PostgreSQL réussie (${userCount} utilisateur(s) trouvé(s))`);
  } catch (err: any) {
    console.error(`[Database]  🔴 Erreur de connexion Prisma PostgreSQL:`, err.message || err);
  }

  // 2. Vérification statut Telegram Bot
  if (bot) {
    console.log(`[Telegram]  🟢 Bot Telegram initialisé et prêt à recevoir/envoyer des messages.`);
  } else {
    console.log(`[Telegram]  🟡 Bot Telegram désactivé (TELEGRAM_BOT_TOKEN absent).`);
  }

  // 3. Vérification Resend Email
  if (process.env.RESEND_API_KEY) {
    console.log(`[Resend]    🟢 API Key Resend configurée (${process.env.RESEND_FROM_EMAIL || 'StatutShop Email'})`);
  } else {
    console.log(`[Resend]    🟡 RESEND_API_KEY non configuré dans .env`);
  }

  console.log(`==================================================\n`);

  restoreWhatsAppSessions();
});