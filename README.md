# 🛍️ StatutShop — SaaS E-Commerce & Gestion WhatsApp

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-blue?logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-555555?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**StatutShop** est une plateforme e-commerce hybride spécialement conçue pour les micro-commerçants et vendeurs opérant via les statuts et groupes WhatsApp au Cameroun et en Afrique Centrale.

Elle permet à chaque vendeur de transformer ses publications informelles en un **catalogue Web professionnel**, de gérer ses ventes, d'automatiser le suivi de ses réserves/stocks, et de calculer en temps réel son **bénéfice net réel** (en déduisant les prix d'achat grossistes et les frais de livraison/taxi).

---

## 🚀 Fonctionnalités Clés

### 🛒 Côté Client (Catalogue Web)
- 📱 **Catalogue Mobile-First :** Interface fluide accessible via un lien personnalisé (`statutshop.cm/vendeur-nom`).
- ⚡ **Commande en 1 Clic :** Redirection dynamique vers WhatsApp avec message pré-rempli contenant le récapitulatif de la commande.
- 🚕 **Calculateur de Livraison :** Prise en compte transparente des frais de transport/taxi dès la commande.

### 📊 Côté Vendeur (Dashboard Privé)
- 🔐 **Connexion Sécurisée via OTP WhatsApp :** Authentification sans mot de passe via l'API officielle Meta Cloud API (100% utilisable sur smartphone, sans scanner de QR Code).
- 📦 **Gestion Simplifiée du Catalogue :** Ajout rapide de produits, photos, prix de vente et prix grossiste.
- 💰 **Bilan financier réel :** Calcul automatique :
  $$\text{Bénéfice Net} = \text{Prix Vente} - \text{Prix Grossiste} - \text{Frais Livraison Supportés}$$
- 🤖 **Bilan WhatsApp Automatique :** Envoi du récapitulatif de caisse du jour directement sur WhatsApp.
- ⏰ **Anti-Réservations Fantômes :** Libération automatique des stocks réservés et non validés après 1 heure.

---

## 🛠️ Stack Technique

- **Frontend :** Next.js (App Router), React, Tailwind CSS, Lucide React Icons.
- **Backend :** Node.js, Express.js avec TypeScript (Architecture REST API MVC).
- **Base de données :** PostgreSQL hébergé sur [Neon DB](https://neon.tech/).
- **ORM :** [Prisma](https://www.prisma.io/) pour le typage strict et les migrations.
- **Authentification & SMS/OTP :** Meta WhatsApp Cloud API (Graph API v18.0+).
- **Sécurité :** JWT (HttpOnly Cookies), Argon2 (Password Hashing), Helmet, Rate-Limiting, CORS, Zod Validation.

---

## 📁 Structure du Projet

```text
statutshop/
├── client/                     # Application Frontend Next.js
│   ├── app/                    # App Router Pages
│   │   ├── (auth)/             # Pages Login / Signup / Verify-OTP
│   │   ├── dashboard/          # Espace privé Vendeur (Produits, Commandes, Finances)
│   │   └── shop/[store_slug]/  # Catalogue public Client
│   ├── components/             # Composants UI réutilisables (Tailwind CSS)
│   └── lib/                    # Utilitaires & appels API
│
├── server/                     # Application Backend Express.js
│   ├── src/
│   │   ├── controllers/        # Contrôleurs HTTP (Auth, Products, Orders, Finance)
│   │   ├── middlewares/        # Authentication JWT, Rate-Limiting, Error Handler
│   │   ├── routes/             # Routes REST API (v1)
│   │   ├── services/           # Services métiers & Intégration Meta WhatsApp API
│   │   └── utils/              # Helper functions & Hash tools
│   ├── prisma/
│   │   └── schema.prisma       # Schéma de la Base de Données PostgreSQL
│   └── .env.example            # Fichier d'exemple des variables d'environnement
│
└── README.md                   # Documentation du projet
git clone https://github.com/mbafokou2-design/statutshop/
cd statutshop
cd server
npm install
npx prisma db push
npm run dev
cd ../client
npm install
npm run dev
L'application web sera accessible sur http://localhost:3000 et l'API Backend sur http://localhost:5000.

🛡️ Sécurité & Bonnes Pratiques
Isolation Multi-Tenant : Chaque requête SQL/Prisma sur les produits et finances isole les données par le vendeur_id issu du token JWT vérifié.

Protection Anti-Spam OTP : Limiteur de débit (rate-limit) bridant les demandes de code OTP à un maximum de 3 tentatives par numéro de téléphone toutes les 15 minutes.

Cookies Sécurisés : Tokens JWT transmis exclusivement via des cookies HTTPOnly avec flags SameSite=Lax et Secure en production.

📝 Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
