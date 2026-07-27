export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function generateWhatsAppLink(
  whatsappNumber: string,
  clientName: string,
  clientPhone: string,
  address: string,
  productTitle: string,
  price: number,
  quantity: number,
  deliveryOption: string
): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const total = price * quantity;

  const text = `Bonjour ! Je souhaite commander :\n\n🛍️ *${productTitle}*\nQuantité : ${quantity}\nTotal : ${formatCurrency(total)}\n\n👤 Nom : ${clientName}\n📞 Téléphone : ${clientPhone}\n📍 Adresse : ${address}\n🚕 Livraison : ${deliveryOption}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}