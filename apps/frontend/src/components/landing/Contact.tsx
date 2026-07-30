import { Mail, MapPin, Phone, Send, MessageSquare } from 'lucide-react'

type ContactProps = {
  contactForm: {
    name: string
    phone: string
    email: string
    city: string
    subject: string
    message: string
  }
  setContactForm: React.Dispatch<React.SetStateAction<{
    name: string
    phone: string
    email: string
    city: string
    subject: string
    message: string
  }>>
  isSubmittingContact: boolean
  handleContactSubmit: (e: React.FormEvent) => void
}

export function Contact({
  contactForm,
  setContactForm,
  isSubmittingContact,
  handleContactSubmit,
}: ContactProps) {
  return (
    <section id="contact" className="py-20 relative">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Assistance & Partenariat
          </p>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
            Contactez l'Équipe StatutShop
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information Card */}
          <div className="lg:col-span-5 bg-ink-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-whatsapp" />
                Nos Coordonnées
              </h3>
              <p className="text-xs text-slate-400">
                Fondateur & Propriétaire : <span className="text-white font-semibold">Mbafokou (StatutShop Inc.)</span>
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60">
                <Phone className="w-4 h-4 text-whatsapp shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Téléphone / WhatsApp</span>
                  <span className="text-white font-semibold font-mono text-sm block">+237 680 57 88 11</span>
                  <span className="text-slate-300 font-semibold font-mono text-xs block mt-0.5">+237 659 49 58 89</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60">
                <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Email Officiel</span>
                  <span className="text-white font-semibold">mbafokou2@gmail.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/60">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Bureaux Physiques</span>
                  <span className="text-white font-semibold">Douala & Yaoundé, Cameroun</span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <div className="bg-gradient-to-br from-emerald-600/10 to-teal-700/10 border border-whatsapp/20 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-whatsapp" />
                <span>Support Direct WhatsApp</span>
              </div>
              <a
                href="https://wa.me/237680578811?text=Bonjour%20l'equipe%20StatutShop,%20je%20souhaite%20creer%20ma%20boutique%20en%20ligne."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discuter avec Mbafokou sur WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-ink-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Envoyez-nous un message</h3>
              <p className="text-xs text-slate-400 mt-1">Remplissez ce formulaire et recevez notre réponse par email ou WhatsApp.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200">Nom Complet <span className="text-whatsapp">*</span></label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Ex: Vanessa Ebode"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-whatsapp"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200">Numéro WhatsApp <span className="text-whatsapp">*</span></label>
                  <input
                    type="text"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+237 680 57 88 11"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-whatsapp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200">Adresse Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-whatsapp"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200">Ville</label>
                  <select
                    value={contactForm.city}
                    onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-whatsapp"
                  >
                    <option value="Douala">Douala</option>
                    <option value="Yaoundé">Yaoundé</option>
                    <option value="Bafoussam">Bafoussam</option>
                    <option value="Garoua">Garoua</option>
                    <option value="Autre">Autre Ville</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-200">Votre Message <span className="text-whatsapp">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Expliquez-nous votre besoin..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-whatsapp resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingContact}
                className="w-full py-3.5 bg-whatsapp hover:bg-[#2ee071] text-ink-950 font-semibold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingContact ? (
                  <span>Envoi du message en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer mon message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
