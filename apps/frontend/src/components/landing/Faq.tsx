import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const ITEMS = [
  {
    q: 'Est-ce que je peux utiliser mon propre numéro WhatsApp ?',
    a: 'Oui. Votre boutique est reliée au numéro WhatsApp que vous utilisez déjà. Les commandes arrivent dans la même application, sans changer vos habitudes.',
  },
  {
    q: 'Est-ce que ça marche sur mobile ?',
    a: 'Tout se fait depuis le téléphone : créer la boutique, ajouter les produits, suivre les commandes. Vos clients n’ont rien à installer, ils ouvrent simplement votre lien.',
  },
  {
    q: 'Est-ce que c’est gratuit ?',
    a: 'La création de la boutique est gratuite et nous ne prenons aucune commission sur vos ventes. Certaines options avancées seront payantes plus tard, mais l’essentiel reste gratuit.',
  },
  {
    q: 'Est-ce que mes clients peuvent payer en espèces ?',
    a: 'Oui. Paiement à la livraison, Mobile Money ou espèces à la boutique : vous gardez votre façon d’encaisser, StatutShop gère la commande.',
  },
  {
    q: 'Faut-il des connaissances techniques ?',
    a: 'Non. Si vous savez publier un statut WhatsApp, vous savez utiliser StatutShop. Et si vous bloquez, écrivez-nous, on vous accompagne.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="border-y border-slate-800/60 bg-ink-900/30 py-20 sm:py-28">
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Questions fréquentes
          </p>
          <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[34px]">
            Les questions qu’on nous pose le plus.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-400">
            Vous avez d'autres doutes ? Écrivez-nous directement via le formulaire de contact ou sur WhatsApp.
          </p>
        </div>

        <ul className="divide-y divide-slate-800/60">
          {ITEMS.map((item, idx) => {
            const isOpen = open === idx
            return (
              <li key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between py-3 text-left font-display text-[15px] font-semibold text-white cursor-pointer hover:text-whatsapp transition-colors"
                >
                  <span>{item.q}</span>
                  <Plus
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-45 text-whatsapp' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-[13.5px] leading-relaxed text-slate-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
