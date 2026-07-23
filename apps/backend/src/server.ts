import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

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

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'StatutShop API is running' });
});

app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`✅ StatutShop backend running on http://localhost:${PORT}`);
});