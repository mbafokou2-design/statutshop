import { ArrowRight } from 'lucide-react'

type FinalCtaProps = {
  onAuthClick: () => void
}

export function FinalCta({ onAuthClick }: FinalCtaProps) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 relative z-10 text-center space-y-8">
        <h2 className="text-3xl sm:text-5xl font-display font-semibold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Prêt à moderniser vos ventes sur WhatsApp ?
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Rejoignez plus de 1 200 commerçants qui ont arrêté d'écrire des prix à la main sur chaque photo.
        </p>
        <button
          onClick={onAuthClick}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 text-[15px] font-semibold text-ink-950 shadow-[0_18px_40px_-18px_rgba(37,211,102,0.9)] transition hover:bg-[#2ee071] active:translate-y-px cursor-pointer"
        >
          Créer ma boutique gratuite
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  )
}
