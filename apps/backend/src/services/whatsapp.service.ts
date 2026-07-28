import axios from 'axios';

export async function sendWhatsAppOtp(phone: string, code: string): Promise<void> {
  const ZINDUA_KEY = process.env.ZINDUA_KEY;
  const ZINDUA_API_URL = process.env.ZINDUA_API_URL || 'https://zindua.run/api/v1';

  if (!ZINDUA_KEY) {
    console.error('❌ ERREUR: ZINDUA_KEY manquant dans le .env');
    throw new Error('La clé API Zindua (ZINDUA_KEY) n\'est pas définie dans le fichier .env');
  }

  // Nettoyage du numéro de téléphone
  const formattedPhone = phone.replace(/\+/g, '').replace(/\s+/g, '').trim();

  try {
    // 🟢 Payload conforme aux exigences de l'API Zindua
    const payload = {
      to: formattedPhone,
      template: 'otp', // Nom du template d'authentification
      channel: 'whatsapp',
      variables: {
        code: code,
      },
    };

    console.log(`🚀 Envoi OTP Zindua vers ${formattedPhone}...`);

    const response = await axios.post(
      `${ZINDUA_API_URL}/send`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ZINDUA_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ OTP WhatsApp envoyé avec succès :', response.data);
  } catch (error: any) {
    console.error('❌ Erreur envoi WhatsApp OTP (Zindua):', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw new Error("Échec de l'envoi du code OTP via WhatsApp");
  }
}