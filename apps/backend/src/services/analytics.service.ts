import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';
import { prisma } from '../lib/prisma';

// Initialisation du client avec les identifiants JSON
let analyticsDataClient: BetaAnalyticsDataClient | null = null;

try {
  const keyPath = path.join(process.cwd(), 'google-service-account.json');
  analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: keyPath,
  });
} catch (e) {
  console.warn('⚠️ Google Analytics Service Account non initialisé:', e);
}

const propertyId = process.env.GA_PROPERTY_ID;

export const getGlobalAnalytics = async () => {
  // Récupération des stats Prisma (BDD interne) comme fallback et complément
  const [shopsVisits, totalShops, totalOrders] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'VENDEUR' },
      select: {
        id: true,
        storeName: true,
        storeSlug: true,
        city: true,
        visitCount: true,
      },
      orderBy: { visitCount: 'desc' },
    }),
    prisma.user.count({ where: { role: 'VENDEUR' } }),
    prisma.order.count(),
  ]);

  const totalPrismaVisits = shopsVisits.reduce((acc, shop) => acc + (shop.visitCount || 0), 0);

  let gaData = null;
  let gaConnected = false;
  let gaError = null;

  if (analyticsDataClient && propertyId) {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
        ],
        dimensions: [{ name: 'date' }],
      });
      gaData = response;
      gaConnected = true;
    } catch (err: any) {
      gaError = err?.message || 'Erreur d\'accès GA4';
      console.error('⚠️ Google Analytics API warning:', gaError);
    }
  }

  return {
    summary: {
      totalVisits: totalPrismaVisits,
      totalShops,
      totalOrders,
      activeUsersGA: gaData?.rows?.[0]?.metricValues?.[0]?.value || 0,
      pageViewsGA: gaData?.rows?.[0]?.metricValues?.[1]?.value || 0,
      sessionsGA: gaData?.rows?.[0]?.metricValues?.[2]?.value || 0,
      gaConnected,
      gaError,
    },
    shopsVisits,
    gaRaw: gaData,
  };
};