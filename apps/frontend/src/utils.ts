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

export function updateMetaTags({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string | null;
  url?: string;
}) {
  document.title = title;

  const setMeta = (nameOrProperty: string, content: string) => {
    let element = document.querySelector(`meta[property="${nameOrProperty}"], meta[name="${nameOrProperty}"]`);
    if (!element) {
      element = document.createElement('meta');
      if (nameOrProperty.startsWith('og:')) {
        element.setAttribute('property', nameOrProperty);
      } else {
        element.setAttribute('name', nameOrProperty);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  setMeta('description', description);
  setMeta('og:title', title);
  setMeta('og:description', description);
  setMeta('og:type', 'website');
  if (image) {
    setMeta('og:image', image);
    setMeta('twitter:image', image);
  }
  if (url) {
    setMeta('og:url', url);
  }
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
}