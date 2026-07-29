import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  Truck,
  Users,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Store,
  Send,
  BarChart3,
  Globe,
} from 'lucide-react';
import { fetchPublicShopsCount } from '../services/whatsapp.service';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shopsCount, setShopsCount] = useState<number>(1200);

  // Formspree / Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Douala',
    subject: 'Création de boutique',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Récupérer le nombre réel de boutiques enregistrées en BDD via la route publique
  useEffect(() => {
    const getCount = async () => {
      const count = await fetchPublicShopsCount();
      if (count > 0) {
        setShopsCount(count);
      }
    };
    getCount();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.message) {
      showToast('Veuillez remplir votre nom, téléphone et message.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      // 🟢 Prêt pour Formspree : Remplacez VOTRE_FORM_ID par votre ID Formspree (ex: https://formspree.io/f/xyz)
      // const res = await fetch('https://formspree.io/f/VOTRE_FORM_ID', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...contactForm, _replyto: 'mbafokou2@gmail.com' })
      // });
      
      await new Promise((r) => setTimeout(r, 800));
      showToast('Message envoyé ! Un conseiller StatutShop vous recontactera sous 15 minutes.');
      setContactForm({
        name: '',
        phone: '',
        email: '',
        city: 'Douala',
        subject: 'Création de boutique',
        message: ''
      });
    } catch {
      showToast('Erreur lors de l\'envoi du message.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white scroll-smooth">
      {/* HTML de base pour activer le défilement fluide global */}
      <style dangerouslySetInnerHTML={{__html: `html { scroll-behavior: smooth; }`}} />

      {/* Toast Notif */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo - Placeholder Prêt pour votre image de logo */}
          <div className="cursor-pointer flex items-center gap-2" onClick={() => navigate('/')}>
            {/* 🟢 REMPLACEZ LE src="/logo.png" PAR VOTRE PROPRE LOGO IMAGE LE MOMENT VENU */}
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/5">
              <img 
                src="/logo.png" 
                alt="StatutShop" 
                onError={(e) => {
                  // Fallback élégant en icône si le fichier logo.png n'est pas encore présent
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-emerald-400 font-black text-lg">S</span>';
                  }
                }}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Statut<span className="text-emerald-400">Shop</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#hero" className="hover:text-emerald-400 transition">Accueil</a>
            <a href="#services" className="hover:text-emerald-400 transition">Services</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition">Comment ça marche</a>
            <a href="#why-us" className="hover:text-emerald-400 transition">Pourquoi nous</a>
            <a href="#contact" className="hover:text-emerald-400 transition">Contact</a>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connexion Vendeur</span>
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2.5 text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Créer ma boutique</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-800"
          >
            <span className="sr-only">Menu</span>
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`h-0.5 bg-current rounded transition ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`h-0.5 bg-current rounded transition ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`h-0.5 bg-current rounded transition ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 animate-fade-in text-xs font-bold">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-emerald-400">Accueil</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-emerald-400">Services</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-emerald-400">Comment ça marche</a>
            <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-emerald-400">Pourquoi nous</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-emerald-400">Contact</a>
            
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-center shadow-lg"
              >
                Créer ma boutique gratuite
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                className="w-full py-2 bg-slate-800 text-slate-200 font-bold rounded-xl text-center"
              >
                Espace Vendeur
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>La Plateforme N°1 E-Commerce WhatsApp au Cameroun</span>
              </div>

              <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-white leading-[1.15] tracking-tight">
                Vendez sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">WhatsApp</span> avec votre propre boutique en ligne.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Transformez vos simples statuts en un catalogue digital professionnel. Vos clients parcourent vos articles et passent commande directement sur votre numéro WhatsApp avec tous les détails prêts à être livrés.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-900/40 transition transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span>Créer ma boutique gratuite</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="block text-2xl font-black text-white font-mono">+{shopsCount}</span>
                  <span className="text-xs text-slate-400">Boutiques actives</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-emerald-400 font-mono">0 FCFA</span>
                  <span className="text-xs text-slate-400">Frais de commission</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-white font-mono">100%</span>
                  <span className="text-xs text-slate-400">Optimisé WhatsApp</span>
                </div>
              </div>
            </div>

            {/* Right Graphic Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                {/* Hero Showcase Placeholder Image */}
                <div className="relative rounded-2xl overflow-hidden mb-4 border border-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0a67daf4095a?auto=format&fit=crop&w=800&q=80"
                    alt="Boutique en ligne StatutShop"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                    Vitrine E-Commerce
                  </span>
                </div>

                {/* Simulated Order Notification */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" /> Nouvelle commande !
                    </span>
                    <span className="text-[10px] text-slate-500">Aujourd'hui à 14h20</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/80 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <p className="font-bold text-white">🛒 Robe Soie Tendance</p>
                    <p className="text-emerald-400 font-bold">Prix : 19 500 FCFA</p>
                    <p className="text-slate-400 text-[11px]">Client : Vanessa E. (Douala Akwa)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Nos Services Intelligents
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Tout ce dont votre commerce a besoin pour exploser vos ventes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition group">
              <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Catalogue Produit Digital</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publiez vos fiches produits avec photos illimitées, prix en FCFA, descriptions soignées et gestion des stocks en temps réel.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition group">
              <div className="w-12 h-12 bg-teal-500/15 text-teal-400 border border-teal-500/30 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Commandes 1-Clic WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le client clique sur "Commander". Une discussion s'ouvre sur votre WhatsApp avec un récapitulatif clair et prêt à valider.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition group">
              <div className="w-12 h-12 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Réseau de Livreurs Agréés</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accédez à l'annuaire des livreurs vérifiés par CNI à Douala, Yaoundé et Bafoussam pour expédier rapidement vos colis.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition group">
              <div className="w-12 h-12 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Calcul des Marges Grossistes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Saisissez votre prix d'achat chez le grossiste et votre prix de vente. Le dashboard calcule automatiquement votre bénéfice net.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition group">
              <div className="w-12 h-12 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Lien Bio & Statut WhatsApp</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bénéficiez d'une adresse web unique (`statutshop.cm/votre-nom`) ultra rapide et esthétique à copier dans votre statut WhatsApp.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 space-y-4 shadow-xl transition group">
              <div className="w-12 h-12 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Suivi des Visiteurs & Trafic</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analysez combien de prospects ont visité vos statuts, consulté vos fiches et cliqué sur vos boutons de commande.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Prise en Main en 2 Minutes
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Comment fonctionne StatutShop ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-emerald-500/20 font-mono absolute top-3 right-4">01</span>
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold font-mono">
                1
              </div>
              <h3 className="font-bold text-white text-base">Inscrivez votre boutique</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Renseignez le nom de votre commerce, votre ville et votre numéro WhatsApp commercial.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-emerald-500/20 font-mono absolute top-3 right-4">02</span>
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold font-mono">
                2
              </div>
              <h3 className="font-bold text-white text-base">Ajoutez vos articles</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publiez les photos de vos habits, chaussures, accessoires ou produits de beauté avec prix en FCFA.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-emerald-500/20 font-mono absolute top-3 right-4">03</span>
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold font-mono">
                3
              </div>
              <h3 className="font-bold text-white text-base">Partagez votre lien</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Copiez votre lien StatutShop et collez-le dans vos Statuts WhatsApp, Instagram et groupes d'achat.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-emerald-500/20 font-mono absolute top-3 right-4">04</span>
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold font-mono">
                4
              </div>
              <h3 className="font-bold text-white text-base">Livreurs & Encaissez</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recevez le récapitulatif complet sur WhatsApp, confiez le colis au livreur et recevez vos fonds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY US */}
      <section id="why-us" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Pourquoi choisir StatutShop
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                La solution pensée pour éliminer le désordre dans vos ventes WhatsApp
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">0% Commission sur vos ventes</h4>
                    <p className="text-xs text-slate-400">Vos bénéfices restent intégralement les vôtres sans aucun prélèvement.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Design Moderne & Rapidité Instantanée</h4>
                    <p className="text-xs text-slate-400">Page web ultra fluide qui s'ouvre rapidement même avec une faible connexion 3G.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Annuaire Livreurs Confiance CNI</h4>
                    <p className="text-xs text-slate-400">Numéros directs de livreurs agréés par la modération Super Admin.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase Image Placeholder */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80"
                alt="Gestion E-Commerce StatutShop"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT FORM SECTION */}
      <section id="contact" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Assistance & Partenariat
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Contactez l'Équipe StatutShop
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Information Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  Nos Coordonnées
                </h3>
                <p className="text-xs text-slate-400">
                  Fondateur & Propriétaire : <span className="text-white font-bold">Mbafokou (StatutShop Inc.)</span>
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Téléphone / WhatsApp</span>
                    <span className="text-white font-bold font-mono text-sm block">+237 680 57 88 11</span>
                    <span className="text-slate-300 font-bold font-mono text-xs block mt-0.5">+237 659 49 58 89</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Officiel</span>
                    <span className="text-white font-bold">mbafokou2@gmail.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Bureaux Physiques</span>
                    <span className="text-white font-bold">Douala & Yaoundé, Cameroun</span>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="bg-gradient-to-br from-emerald-600/30 to-teal-700/30 border border-emerald-500/40 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <MessageSquare className="w-4 h-4" />
                  <span>Support Direct WhatsApp</span>
                </div>
                <a
                  href="https://wa.me/237680578811?text=Bonjour%20l'equipe%20StatutShop,%20je%20souhaite%20creer%20ma%20boutique%20en%20ligne."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discuter avec Mbafokou sur WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div>
                <h3 className="text-lg font-bold text-white">Envoyez-nous un message</h3>
                <p className="text-xs text-slate-400 mt-1">Remplissez ce formulaire et recevez notre réponse par email ou WhatsApp.</p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Nom Complet <span className="text-emerald-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Ex: Vanessa Ebode"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Numéro WhatsApp <span className="text-emerald-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+237 680 57 88 11"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Ville</label>
                    <select
                      value={contactForm.city}
                      onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                  <label className="font-bold text-slate-200">Votre Message <span className="text-emerald-400">*</span></label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Expliquez-nous votre besoin..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2"
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

      {/* 7. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800 text-xs text-slate-400 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                {/* 🟢 REMPLACEZ LE src="/logo.png" PAR VOTRE PROPRE LOGO IMAGE LE MOMENT VENU */}
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="StatutShop" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-emerald-400 font-black text-xs">S</span>';
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-base font-black text-white">StatutShop</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                StatutShop est la plateforme e-commerce N°1 au Cameroun pour créer sa boutique WhatsApp en 2 minutes.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#hero" className="hover:text-emerald-400 transition">Accueil</a></li>
                <li><a href="#services" className="hover:text-emerald-400 transition">Services</a></li>
                <li><a href="#contact" className="hover:text-emerald-400 transition">Contact</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Accès</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/auth')} className="hover:text-emerald-400 transition">Créer ma boutique</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-emerald-400 transition">Connexion Vendeur</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contact Direct</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+237 680 57 88 11</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+237 659 49 58 89</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>mbafokou2@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 StatutShop Inc. Développé par Mbafokou. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
