import axios from 'axios';

export async function sendEmailOtp(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY non défini dans le fichier .env.');
    throw new Error("Clé API Resend manquante dans la configuration du serveur (RESEND_API_KEY). Veuillez ajouter RESEND_API_KEY dans votre fichier .env.");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'StatutShop <onboarding@resend.dev>';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0f172a; color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #22c55e; margin: 0;">StatutShop</h2>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Plateforme E-Commerce WhatsApp</p>
      </div>
      <div style="background-color: #1e293b; padding: 24px; border-radius: 12px; text-align: center;">
        <p style="font-size: 16px; margin-bottom: 10px; color: #cbd5e1;">Voici votre code de vérification :</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #22c55e; margin: 20px 0; background-color: #0f172a; padding: 12px; border-radius: 8px; display: inline-block;">
          ${code}
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 15px;">Ce code est valide pendant 5 minutes. Ne le partagez avec personne.</p>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
        Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.
      </p>
    </div>
  `;

  try {
    await axios.post(
      'https://api.resend.com/emails',
      {
        from: fromEmail,
        to: [email],
        subject: `${code} est votre code de vérification StatutShop`,
        html: htmlContent,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Code OTP Resend envoyé avec succès à ${email}`);
  } catch (error: any) {
    const errorDetails = error.response?.data?.message || error.message || 'Erreur inconnue';
    console.error(`❌ Erreur d'envoi d'e-mail Resend:`, errorDetails);
    throw new Error(`Échec de l'envoi de l'e-mail OTP via Resend: ${errorDetails}`);
  }
}
