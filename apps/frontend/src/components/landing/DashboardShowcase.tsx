import { motion } from 'framer-motion'
import { Placeholder } from './Placeholder'

export function DashboardShowcase() {
  return (
    <section id="dashboard" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Aperçu
            </p>
            <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[38px]">
              Votre vitrine de vente, en direct sur WhatsApp.
            </h2>
          </div>
          <p className="max-w-sm text-[14.5px] leading-relaxed text-slate-400">
            Partagez votre lien de boutique StatutShop en direct à vos clients.
            Ils commandent en un clic et vous recevez les commandes directement dans votre WhatsApp.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="relative mt-12"
        >
          <div className="pointer-events-none absolute inset-x-16 -top-6 h-24 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative rounded-[28px] border border-slate-800/80 bg-ink-900/40 p-3 shadow-panel">
            <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-700" />
                <span className="h-2 w-2 rounded-full bg-slate-700" />
                <span className="h-2 w-2 rounded-full bg-slate-700" />
              </div>
              <span className="font-mono text-[10.5px] text-slate-600">
                app.statutshop.cm
              </span>
              <span className="w-12" />
            </div>
            <Placeholder
              label="Espace d'Administration StatutShop"
              hint="Statistiques de vente, liste des produits et suivi des commandes."
              
              imageUrl="/stat.png"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
