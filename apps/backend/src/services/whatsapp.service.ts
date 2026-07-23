import axios from 'axios';

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.META_USER_ACCESS_TOKEN;
const TEMPLATE_NAME = process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'statutshop_otp';

export async function sendWhatsAppOtp(phone: string, code: string): Promise<void> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: TEMPLATE_NAME,
          language: { code: 'fr' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: code }],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: code }],
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Erreur envoi WhatsApp OTP:', error.response?.data || error.message);
    throw new Error("Échec de l'envoi du code OTP via WhatsApp");
  }
}