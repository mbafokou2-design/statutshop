import { Quote } from 'lucide-react'

const SLOTS = [
  { label: 'Client 1', hint: 'Photo, nom, ville et avis à ajouter.' },
  { label: 'Client 2', hint: 'Photo, nom, ville et avis à ajouter.' },
  { label: 'Client 3', hint: 'Photo, nom, ville et avis à ajouter.' },
]

export function SocialProof() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Ils utilisent StatutShop
            </p>
            <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[38px]">
              Les avis de vraies boutiques, bientôt ici.
            </h2>
          </div>
          <p className="max-w-sm text-[14.5px] leading-relaxed text-slate-500">
            Nous préférons attendre de vrais témoignages plutôt que d’en
            inventer. Ces emplacements sont réservés.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {SLOTS.map((slot) => (
            <article
              key={slot.label}
              className="flex min-h-[220px] flex-col justify-between rounded-3xl border border-dashed border-slate-800 bg-slate-900/25 p-6"
            >
              <Quote className="h-5 w-5 text-slate-700" aria-hidden="true" />
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-slate-500">
                  {slot.label} — Placeholder
                </p>
                <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-slate-600">
                  {slot.hint}
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-800/70 pt-4">
                <span className="h-8 w-8 rounded-full border border-dashed border-slate-800" />
                <span className="h-2 w-24 rounded-full bg-slate-800/80" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
