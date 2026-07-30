import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'

const LINKS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Comment ça marche', href: '#comment-ca-marche' },
  { label: 'Pourquoi StatutShop', href: '#pourquoi' },
  { label: 'Contact', href: '#contact' },
]

type NavigationProps = {
  onAuthClick: () => void
}

export function Navigation({ onAuthClick }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-800/70 bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-6 px-5 sm:px-8">
        <Logo />

        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-1 lg:flex"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-[13.5px] text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={onAuthClick}
            className="rounded-xl px-3.5 py-2 text-[13.5px] font-medium text-slate-300 transition-colors hover:text-white cursor-pointer"
          >
            Connexion vendeur
          </button>
          <button
            onClick={onAuthClick}
            className="rounded-xl bg-whatsapp px-4 py-2 text-[13.5px] font-semibold text-ink-950 shadow-[0_10px_30px_-12px_rgba(37,211,102,0.8)] transition hover:bg-[#2ee071] active:translate-y-px cursor-pointer"
          >
            Créer ma boutique
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 md:hidden cursor-pointer"
          aria-expanded={open}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-800/70 bg-ink-950/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <nav aria-label="Navigation mobile" className="flex flex-col">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-slate-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-800/70 pt-3">
            <button
              onClick={() => { setOpen(false); onAuthClick(); }}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-center text-sm text-slate-200 cursor-pointer"
            >
              Connexion vendeur
            </button>
            <button
              onClick={() => { setOpen(false); onAuthClick(); }}
              className="rounded-xl bg-whatsapp px-4 py-2.5 text-center text-sm font-semibold text-ink-950 cursor-pointer"
            >
              Créer ma boutique
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
