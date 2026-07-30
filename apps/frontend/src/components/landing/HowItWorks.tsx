import { motion } from 'framer-motion'

const STEPS = [
  {
    n: '01',
    title: 'Créez votre compte',
    text: 'Votre numéro WhatsApp, le nom de votre boutique, et c’est ouvert. Une minute, pas plus.',
    meta: 'Gratuit',
  },
  {
    n: '02',
    title: 'Ajoutez vos produits',
    text: 'Photos, prix, description, stock. Les mêmes photos que vous mettiez déjà en statut.',
    meta: 'Illimité',
  },
  {
    n: '03',
    title: 'Partagez votre lien',
    text: 'Dans votre statut, votre bio Instagram, vos groupes ou sur vos flyers.',
    meta: 'statutshop.cm/…',
  },
  {
    n: '04',
    title: 'Recevez vos commandes',
    text: 'Le client commande, le récapitulatif arrive sur WhatsApp. Vous confirmez et vous livrez.',
    meta: 'Sur WhatsApp',
  },
]

export function HowItWorks() {
  return (
    <section
      id="comment-ca-marche"
      className="relative border-y border-slate-800/60 bg-ink-900/30 py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Comment ça marche
          </p>
          <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[38px]">
            De zéro à votre première commande en moins de deux minutes.
          </h2>
        </div>

        <ol className="relative mt-14">
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-2 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-whatsapp/50 via-slate-800 to-transparent sm:block"
          />
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative grid grid-cols-1 gap-4 border-b border-slate-800/70 py-7 last:border-b-0 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-7"
            >
              <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-ink-950 font-mono text-[11px] text-whatsapp">
                {step.n}
              </span>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)_auto] md:items-baseline md:gap-8">
                <h3 className="font-display text-[19px] font-semibold tracking-tight text-white">
                  {step.title}
                </h3>
                <p className="max-w-md text-[14px] leading-relaxed text-slate-400">
                  {step.text}
                </p>
                <span className="justify-self-start rounded-full border border-slate-800 px-3 py-1 font-mono text-[10.5px] uppercase tracking-wider text-slate-500 md:justify-self-end">
                  {step.meta}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
