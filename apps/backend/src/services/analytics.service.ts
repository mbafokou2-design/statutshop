import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';

// Initialisation du client avec les identifiants JSON
const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(__dirname, '../../google-service-account.json'),
});

const propertyId = process.env.GA_PROPERTY_ID;

export const getGlobalAnalytics = async () => {
  if (!propertyId) {
    throw new Error('GA_PROPERTY_ID manquant dans le .env');
  }

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'sessions' },
    ],
    dimensions: [{ name: 'city' }, { name: 'deviceCategory' }],
  });

  return response;
};