import {
  Gauge,
  MapPin,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Placeholder } from './Placeholder'

const BENEFITS = [
  {
    icon: Wallet,
    title: 'Aucune commission mensuelle',
    text: 'Pas d’abonnement caché, pas de pourcentage prélevé sur vos ventes.',
  },
  {
    icon: Gauge,
    title: 'Chargement rapide',
    text: 'La boutique s’ouvre même avec une connexion faible ou peu de forfait.',
  },
  {
    icon: Smartphone,
    title: 'Fonctionne sur tous les téléphones',
    text: 'Android, iPhone, ancien modèle : votre client n’installe rien.',
  },
  {
    icon: MapPin,
    title: 'Pensé pour les commerces africains',
    text: 'Prix en FCFA, paiement à la livraison, quartiers et villes du Cameroun.',
  },
  {
    icon: Sparkles,
    title: 'Une image professionnelle',
    text: 'Un lien propre à partager, qui rassure le client avant même le premier message.',
  },
]

export function WhyStatutShop() {
  return (
    <section
      id="pourquoi"
      className="border-y border-slate-800/60 bg-ink-900/30 py-20 sm:py-28"
    >
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Pourquoi StatutShop
          </p>
          <h2 className="mt-4 max-w-lg font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[38px]">
            Construit pour la façon dont on vend vraiment ici.
          </h2>

          <ul className="mt-10 divide-y divide-slate-800/70 border-t border-slate-800/70">
            {BENEFITS.map((b) => {
              const Icon = b.icon
              return (
                <li key={b.title} className="flex gap-4 py-5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/60 ring-1 ring-inset ring-slate-700/50">
                    <Icon
                      className="h-4 w-4 text-whatsapp"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-medium text-white">
                      {b.title}
                    </h3>
                    <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-slate-400">
                      {b.text}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="lg:pt-16">
          <div className="mx-auto w-full max-w-[320px] rounded-[36px] border border-slate-800 bg-ink-950/60 p-3 shadow-panel">
            <div className="mb-2 flex justify-center">
              <span className="h-1 w-16 rounded-full bg-slate-800" />
            </div>
            <Placeholder
              label="Vitrine Mobile StatutShop"
              hint="Affichage fluide et ergonomique optimisé pour smartphone."
              ratio="9 / 17"
              className="rounded-[26px]"
              compact
              imageUrl="/block.jpg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
