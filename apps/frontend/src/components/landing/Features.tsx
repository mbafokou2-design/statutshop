import { motion } from 'framer-motion'
import {
  Bike,
  Boxes,
  Check,
  LayoutDashboard,
  Link,
  MessageCircle,
  Wallet,
} from 'lucide-react'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
      {children}
    </p>
  )
}

export function Features() {
  return (
    <section id="fonctionnalites" className="py-20 sm:py-28">
      <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <SectionLabel>Fonctionnalités</SectionLabel>
            <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white sm:text-[38px]">
              Tout ce qu’il faut pour vendre, rien de plus.
            </h2>
          </div>
          <p className="max-w-sm text-[14.5px] leading-relaxed text-slate-400">
            Pensé avec des vendeurs de Douala et Yaoundé, testé sur de vraies
            boutiques avant d’être mis en ligne.
          </p>
        </div>

        {/* Row 1 — a wide feature + a tall one */}
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-ink-900/40 p-7 lg:col-span-2"
          >
            <div className="max-w-md">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/70 ring-1 ring-inset ring-slate-700/60">
                <Boxes
                  className="h-4 w-4 text-whatsapp"
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
                Catalogue produits
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-slate-400">
                Produits illimités, avec photos, prix, description et stock.
                Vous mettez à jour une fois, le client voit toujours la bonne
                information.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {['Photos', 'Prix', 'Stock'].map((tag) => (
                <div
                  key={tag}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3"
                >
                  <p className="text-[12.5px] text-slate-300">{tag}</p>
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-slate-600">
                    Illimité
                  </p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-ink-900/40 p-7"
          >
            <div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-whatsapp/12 ring-1 ring-inset ring-whatsapp/25">
                <MessageCircle
                  className="h-4 w-4 text-whatsapp"
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
                Commande WhatsApp
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-slate-400">
                Un seul clic sur le produit : le récapitulatif de commande
                arrive tout prêt dans votre discussion.
              </p>
            </div>
            <div className="mt-6 rounded-2xl rounded-br-md border border-whatsapp/20 bg-whatsapp/[0.06] p-3.5">
              <p className="text-[12.5px] leading-relaxed text-slate-200">
                Bonjour, je commande&nbsp;:
                <br />
                <span className="text-white">1 × Robe élégante — 19 500 F</span>
                <br />
                <span className="text-slate-400">Livraison : Bonapriso</span>
              </p>
              <p className="mt-2 text-right font-mono text-[10px] text-whatsapp/70">
                envoyé
              </p>
            </div>
          </motion.article>
        </div>

        {/* Row 2 — link feature split with two compact cards */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-slate-800/80 bg-ink-900/40 p-7"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/70 ring-1 ring-inset ring-slate-700/60">
              <Link className="h-4 w-4 text-whatsapp" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
              Lien de boutique personnel
            </h3>
            <p className="mt-2.5 text-[14px] leading-relaxed text-slate-400">
              Une adresse à vous, à coller dans votre statut, votre bio ou vos
              flyers.
            </p>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-whatsapp" />
              <code className="truncate font-mono text-[12.5px] text-slate-300">
                statutshop.cm/<span className="text-white">votre-boutique</span>
              </code>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="rounded-3xl border border-slate-800/80 bg-ink-900/40 p-7 lg:col-span-2"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="sm:max-w-xs">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/70 ring-1 ring-inset ring-slate-700/60">
                  <LayoutDashboard
                    className="h-4 w-4 text-whatsapp"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
                  Tableau de bord
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-slate-400">
                  Vos ventes, vos visiteurs et vos commandes réunis sur un seul
                  écran, lisible même sur un petit téléphone.
                </p>
              </div>
              <ul className="flex-1 divide-y divide-slate-800/80 border-t border-slate-800/80 sm:border-t-0">
                {['Ventes du jour', 'Visiteurs de la boutique', 'Commandes en attente'].map(
                  (item) => (
                    <li
                      key={item}
                      className="flex items-center justify-between py-3 text-[13.5px] text-slate-300"
                    >
                      {item}
                      <span className="font-mono text-[11px] text-slate-600">
                        temps réel
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </motion.article>
        </div>

        {/* Row 3 — delivery + commission, different treatment */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-slate-800/80 bg-ink-900/40 p-7"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/70 ring-1 ring-inset ring-slate-700/60">
              <Bike className="h-4 w-4 text-whatsapp" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
              Livreurs partenaires
            </h3>
            <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-slate-400">
              Une liste de livreurs vérifiés dans votre ville. Vous choisissez,
              vous confirmez, le colis part.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-7 w-7 rounded-full border border-slate-700 bg-slate-800"
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-600">
                Livreurs vérifiés
              </span>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="relative overflow-hidden rounded-3xl border border-whatsapp/25 bg-whatsapp/[0.05] p-7"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-whatsapp/15 ring-1 ring-inset ring-whatsapp/30">
              <Wallet
                className="h-4 w-4 text-whatsapp"
                aria-hidden="true"
              />
            </span>
            <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-white">
              Zéro commission
            </h3>
            <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-slate-300">
              Vous encaissez 100 % de vos bénéfices. Nous ne prenons rien sur
              vos ventes, jamais.
            </p>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-whatsapp">
              <Check className="h-4 w-4" aria-hidden="true" />
              Ce que le client paie, vous le gardez.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
