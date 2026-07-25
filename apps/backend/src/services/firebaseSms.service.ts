export async function sendSmsOtp(phone: string, code: string): Promise<void> {
  throw new Error("L'envoi OTP par SMS n'est pas encore activé. Utilise le canal 'telegram' pour le moment.");
}