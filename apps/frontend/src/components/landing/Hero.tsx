import { motion } from 'framer-motion'
import { ArrowRight, Play, ShoppingBag, Loader2 } from 'lucide-react'
import { Placeholder } from './Placeholder'

type HeroProps = {
  shopsCount: number | null
  isLoadingShopsCount?: boolean
  onAuthClick: () => void
}

export function Hero({ shopsCount, isLoadingShopsCount, onAuthClick }: HeroProps) {
  const renderShopsCountValue = () => {
    if (isLoadingShopsCount) {
      return (
        <span className="inline-flex items-center gap-2 text-whatsapp">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs text-slate-400 font-sans font-normal">chargement…</span>
        </span>
      );
    }
    return `+${shopsCount ?? 0}`;
  };

  const statsList = [
    { value: renderShopsCountValue(), label: 'boutiques créées' },
    { value: '0 FCFA', label: 'de commission' },
    { value: '100%', label: 'sur WhatsApp' },
  ]

  return (
    <section id="accueil" className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="hairline-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[140px]" />

      <div className="relative mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16 lg:pb-28">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 py-1.5 pl-1.5 pr-3.5"
          >
            <span className="rounded-full bg-whatsapp/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-whatsapp">
              Cameroun
            </span>
            <span className="text-[12.5px] text-slate-300">
              Plateforme e-commerce WhatsApp
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-6 font-display text-[38px] font-semibold leading-[1.06] tracking-[-0.03em] text-white sm:text-[52px]"
          >
            Transformez votre WhatsApp en véritable boutique en ligne.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-slate-400"
          >
            Créez votre boutique gratuitement, publiez vos produits, et recevez
            vos commandes directement sur WhatsApp. Aucune compétence technique
            nécessaire.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <button
              onClick={onAuthClick}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-[14.5px] font-semibold text-ink-950 shadow-[0_18px_40px_-18px_rgba(37,211,102,0.9)] transition hover:bg-[#2ee071] active:translate-y-px cursor-pointer"
            >
              Créer gratuitement
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <a
              href="#dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-5 py-3 text-[14.5px] font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Voir une démo
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6 border-t border-slate-800/80 pt-7"
          >
            {statsList.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-[22px] font-semibold tracking-tight text-white">
                  {stat.value}
                </dd>
                <p className="mt-0.5 text-[12.5px] text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative lg:pt-6"
        >
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/30 p-2.5 shadow-panel">
            <div className="flex items-center gap-1.5 px-2.5 pb-2.5 pt-1">
              <span className="h-2 w-2 rounded-full bg-slate-700" />
              <span className="h-2 w-2 rounded-full bg-slate-700" />
              <span className="h-2 w-2 rounded-full bg-slate-700" />
              <span className="ml-2 truncate font-mono text-[10.5px] text-slate-600">
                statutshop.cm/votre-boutique
              </span>
            </div>
            <Placeholder
              label="Boutique E-Commerce StatutShop"
              hint="Aperçu visuel de la vitrine et du catalogue."
              ratio="16 / 11"
              imageUrl="/hero.png"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="absolute -bottom-10 left-2 w-[268px] rounded-2xl border border-slate-800 bg-ink-900/90 p-3.5 shadow-lift backdrop-blur-xl sm:left-6 lg:-left-10"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-whatsapp" />
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wider text-whatsapp">
                Nouvelle commande
              </p>
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/80">
                <ShoppingBag
                  className="h-4 w-4 text-slate-300"
                  aria-hidden="true"
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-white">
                  Robe élégante
                </p>
                <p className="mt-0.5 font-display text-[15px] font-semibold text-whatsapp">
                  19 500 FCFA
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2.5 text-[12px]">
              <span className="text-slate-500">Client : Vanessa</span>
              <span className="text-slate-400">Douala</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
