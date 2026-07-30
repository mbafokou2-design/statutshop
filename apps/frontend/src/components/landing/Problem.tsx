import { motion } from 'framer-motion'
import { ArrowDown, Check } from 'lucide-react'

const QUESTIONS = [
  { text: 'C’est combien ?', time: '08:12' },
  { text: 'Encore disponible ?', time: '08:14' },
  { text: 'Vous livrez à Bonabéri ?', time: '08:21' },
  { text: 'Il reste la taille M ?', time: '09:03' },
  { text: 'Vous êtes où exactement ?', time: '09:40' },
  { text: 'Envoyez le numéro svp', time: '10:05' },
  { text: 'C’est combien déjà ?', time: '10:18' },
  { text: 'Photo du dos ?', time: '11:32' },
]

const SOLVED = [
  'Prix, stock et photos toujours à jour sur votre lien',
  'Le client choisit, la commande arrive prête sur WhatsApp',
  'Vous répondez pour vendre, plus pour répéter',
]

export function Problem() {
  return (
    <section className="relative border-y border-slate-800/60 bg-ink-900/30 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Le problème
          </p>
          <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[38px]">
            Pourquoi vendre uniquement avec les statuts WhatsApp devient
            compliqué ?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
            Vous publiez un article le matin. À midi, vous avez répondu
            quarante fois aux mêmes questions — et vous avez déjà perdu deux
            clients dans la conversation.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-ink-950/60 p-5 sm:p-7">
            <div className="flex flex-wrap gap-2.5">
              {QUESTIONS.map((q, i) => (
                <motion.div
                  key={q.text + i}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="flex items-end gap-2 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900/80 px-3.5 py-2.5"
                >
                  <span className="text-[13.5px] text-slate-300">{q.text}</span>
                  <span className="font-mono text-[10px] text-slate-600">
                    {q.time}
                  </span>
                </motion.div>
              ))}
              <div className="flex items-center gap-1.5 rounded-2xl border border-dashed border-slate-800 px-3.5 py-2.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-600" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-600 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-600 [animation-delay:300ms]" />
              </div>
            </div>
            <p className="mt-6 border-t border-slate-800/80 pt-5 text-[13.5px] text-slate-500">
              Et tout recommence demain, avec la publication suivante.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:content-start">
            {[
              ['Statuts expirés', '24 h et tout disparaît'],
              ['Aucun historique', 'commandes perdues dans le fil'],
              ['Pas de stock', 'vous vendez ce qui est déjà parti'],
              ['Image amateur', 'le client hésite à payer'],
            ].map(([title, sub]) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4"
              >
                <p className="text-[13.5px] font-medium text-slate-200">
                  {title}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
                  {sub}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/60"
          >
            <ArrowDown
              className="h-4 w-4 text-whatsapp"
              aria-hidden="true"
            />
          </motion.span>

          <div className="mt-8 w-full max-w-3xl rounded-3xl border border-whatsapp/25 bg-whatsapp/[0.04] p-6 sm:p-8">
            <h3 className="font-display text-[20px] font-semibold tracking-tight text-white sm:text-[24px]">
              StatutShop centralise tout au même endroit.
            </h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {SOLVED.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-whatsapp"
                    aria-hidden="true"
                  />
                  <span className="text-[13.5px] leading-relaxed text-slate-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
