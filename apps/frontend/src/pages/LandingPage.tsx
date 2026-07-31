import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublicShopsCount } from '../services/whatsapp.service';
import { Navigation } from '../components/landing/Navigation';
import { Hero } from '../components/landing/Hero';
import { Problem } from '../components/landing/Problem';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { DashboardShowcase } from '../components/landing/DashboardShowcase';
import { WhyStatutShop } from '../components/landing/WhyStatutShop';
import { SocialProof } from '../components/landing/SocialProof';
import { Faq } from '../components/landing/Faq';
import { Contact } from '../components/landing/Contact';
import { FinalCta } from '../components/landing/FinalCta';
import { Footer } from '../components/landing/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shopsCount, setShopsCount] = useState<number | null>(null);
  const [isLoadingShopsCount, setIsLoadingShopsCount] = useState<boolean>(true);

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
      setIsLoadingShopsCount(true);
      try {
        const count = await fetchPublicShopsCount();
        setShopsCount(count);
      } catch {
        setShopsCount(0);
      } finally {
        setIsLoadingShopsCount(false);
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
      const res = await fetch('https://formspree.io/f/xbdnbyka', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, _replyto: 'mbafokou2@gmail.com' })
      });

      if (!res.ok) {
        throw new Error('Form submission failed');
      }

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

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-full w-full bg-ink-950 text-slate-200">
      <Navigation onAuthClick={handleAuthClick} />

      {/* Toast Notif */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] bg-whatsapp text-ink-950 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      <main>
        <Hero shopsCount={shopsCount} isLoadingShopsCount={isLoadingShopsCount} onAuthClick={handleAuthClick} />
        <Problem />
        <Features />
        <HowItWorks />
        <DashboardShowcase />
        <WhyStatutShop />
        <SocialProof />
        <Faq />
        <Contact
          contactForm={contactForm}
          setContactForm={setContactForm}
          isSubmittingContact={isSubmittingContact}
          handleContactSubmit={handleContactSubmit}
        />
        <FinalCta onAuthClick={handleAuthClick} />
      </main>

      <Footer onAuthClick={handleAuthClick} />
    </div>
  );
};
