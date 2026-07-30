import { Mail, Phone } from 'lucide-react'

type FooterProps = {
  onAuthClick: () => void
}

export function Footer({ onAuthClick }: FooterProps) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-xs text-slate-400 pt-16 pb-12">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center overflow-hidden">
                <img
                  src="/StatutShop.png"
                  alt="StatutShop Logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<span class="text-whatsapp font-black text-sm">S</span>';
                    }
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base font-display font-semibold text-white">StatutShop</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              StatutShop est la plateforme e-commerce N°1 au Cameroun pour créer sa boutique WhatsApp en 2 minutes.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li><a href="#accueil" className="hover:text-whatsapp transition">Accueil</a></li>
              <li><a href="#fonctionnalites" className="hover:text-whatsapp transition">Services</a></li>
              <li><a href="#contact" className="hover:text-whatsapp transition">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Accès</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onAuthClick}
                  className="hover:text-whatsapp transition cursor-pointer text-left"
                >
                  Créer ma boutique
                </button>
              </li>
              <li>
                <button
                  onClick={onAuthClick}
                  className="hover:text-whatsapp transition cursor-pointer text-left"
                >
                  Connexion Vendeur
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact Direct</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-whatsapp shrink-0" />
                <span>+237 680 57 88 11</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-whatsapp shrink-0" />
                <span>+237 659 49 58 89</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>mbafokou2@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 StatutShop Inc. Développé par Mbafokou. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
