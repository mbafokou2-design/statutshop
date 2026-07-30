

type LogoProps = {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <a
      href="#accueil"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="StatutShop — retour en haut de la page"
    >
      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center overflow-hidden shrink-0">
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
      <span className="font-display text-[17px] font-semibold tracking-tight text-white font-sans">
        Statut<span className="text-whatsapp">Shop</span>
      </span>
    </a>
  )
}
