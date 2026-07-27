import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes'; // <-- 1. Import des routes produits
import publicShopRoutes from './routes/publicShop.routes';
import './services/telegramBot.service';
import settingsRoutes from './routes/settings.routes';
import deliveryPartnerRoutes from './routes/deliveryPartner.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'StatutShop API is running' });
});

app.listen(PORT, () => {
  console.log(`✅ StatutShop backend running on http://localhost:${PORT}`);
});