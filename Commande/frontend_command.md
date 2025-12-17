# 🎯 COMMANDE FRONTEND - SYSTÈME DE GESTION DES MARIAGES CIVILS

## 📋 CONTEXTE DU PROJET

Tu dois créer un frontend complet pour une application de gestion des mariages civils au Cameroun. Le backend est **déjà opérationnel** sur `http://localhost:3333` avec une API REST complète.

### Backend Existant
- **URL API**: `http://localhost:3333/api`
- **Base de données**: PostgreSQL (8 tables)
- **Authentification**: JWT avec tokens (format: `oat_MQ.xxxxx`)
- **Status**: ✅ Opérationnel et testé

### Comptes de Test Disponibles
```javascript
// Super Admin
{ email: "superadmin@mariage.cm", password: "password123" }

// Admin Mairie Douala
{ email: "admin.dla1@mairie.cm", password: "password123" }

// Agent Mairie Douala
{ email: "agent.dla1@mairie.cm", password: "password123" }

// Admin Mairie Yaoundé
{ email: "admin.yde1@mairie.cm", password: "password123" }
```

---

## 🏗️ ARCHITECTURE TECHNIQUE REQUISE

### Stack Technologique OBLIGATOIRE
```json
{
  "framework": "React 18+ avec TypeScript",
  "build": "Vite",
  "styling": "Tailwind CSS 3+",
  "routing": "React Router v6",
  "state": "Zustand (pour auth et état global)",
  "http": "Axios avec intercepteurs",
  "forms": "React Hook Form + Zod",
  "ui": "shadcn/ui components",
  "icons": "Lucide React",
  "date": "date-fns",
  "pdf": "react-pdf ou jsPDF",
  "notifications": "react-hot-toast"
}
```

### Structure de Dossiers OBLIGATOIRE
```
src/
├── api/
│   ├── client.ts           # Instance Axios configurée
│   ├── endpoints.ts        # URLs des endpoints
│   └── services/
│       ├── auth.service.ts
│       ├── marriage.service.ts
│       ├── town-hall.service.ts
│       └── user.service.ts
├── components/
│   ├── ui/                 # shadcn components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── marriage/
│   │   ├── MarriageList.tsx
│   │   ├── MarriageForm.tsx
│   │   ├── MarriageDetails.tsx
│   │   └── MarriageFilters.tsx
│   ├── pdf/
│   │   ├── ActePDFViewer.tsx
│   │   └── ActePDFGenerator.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ConfirmDialog.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── MarriagesPage.tsx
│   ├── MarriageDetailPage.tsx
│   ├── NewMarriagePage.tsx
│   ├── TownHallsPage.tsx
│   ├── UsersPage.tsx
│   └── NotFoundPage.tsx
├── stores/
│   ├── authStore.ts        # État auth (user, token, role)
│   └── uiStore.ts          # État UI (sidebar, modals)
├── types/
│   ├── api.types.ts
│   ├── user.types.ts
│   └── marriage.types.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useMarriages.ts
│   └── useTownHalls.ts
├── App.tsx
├── main.tsx
└── router.tsx
```

---

## 🔐 GESTION DE L'AUTHENTIFICATION

### 1. Configuration Axios (src/api/client.ts)
```typescript
import axios from 'axios';
import { authStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:3333/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur REQUEST: Ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur RESPONSE: Gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. Store d'Authentification (src/stores/authStore.ts)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { user, token } = response.data.data;
        set({ user, token, isAuthenticated: true });
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      checkAuth: () => get().isAuthenticated
    }),
    { name: 'auth-storage' }
  )
);
```

### 3. Route Protégée (src/components/auth/ProtectedRoute.tsx)
```typescript
import { Navigate } from 'react-router-dom';
import { authStore } from '@/stores/authStore';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { isAuthenticated, user } = authStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

---

## 📄 PAGES DÉTAILLÉES

### PAGE 1: Login (src/pages/LoginPage.tsx)

**Spécifications:**
- Design moderne avec fond dégradé camerounais (vert/rouge/jaune)
- Logo de la République du Cameroun
- Formulaire centré avec validation en temps réel
- Messages d'erreur clairs
- Loading state pendant l'authentification
- Redirection automatique après login

**Champs du formulaire:**
- Email (validation: format email)
- Mot de passe (validation: minimum 8 caractères)
- Checkbox "Se souvenir de moi"
- Bouton "Se connecter" avec spinner

**Comportement:**
1. Validation avec Zod
2. Appel API POST `/api/auth/login`
3. Stockage du token dans le store
4. Redirection vers `/dashboard`

---

### PAGE 2: Dashboard (src/pages/DashboardPage.tsx)

**Layout:**
```
+-------------------+----------------------------------+
|                   |  Statistiques en grille (4 cards)|
|   Sidebar         |  - Total mariages                |
|   Navigation      |  - En attente                    |
|                   |  - Validés ce mois               |
|                   |  - Actes générés                 |
+-------------------+----------------------------------+
|                   |  Graphique des mariages (mois)   |
|                   +----------------------------------+
|                   |  Liste derniers mariages         |
+-------------------+----------------------------------+
```

**Statistiques à afficher:**
- Cards avec icônes (Lucide React)
- Couleurs: succès (vert), warning (orange), info (bleu), neutre (gris)
- Données récupérées de l'API

**Graphique:**
- Bibliothèque: Recharts
- Type: BarChart ou LineChart
- Données: Mariages par mois (12 derniers mois)

**Tableau des derniers mariages:**
- Colonnes: Date demande, Époux, Épouse, Statut, Actions
- Pagination (10 par page)
- Bouton "Voir détails" pour chaque ligne

---

### PAGE 3: Gestion des Mariages (src/pages/MarriagesPage.tsx)

**Fonctionnalités OBLIGATOIRES:**

1. **Barre de recherche et filtres:**
```typescript
interface Filters {
  search: string;           // Recherche par nom
  status: string[];         // pending, approved, rejected
  townHallId: number | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}
```

2. **Actions selon le rôle:**
```typescript
// SUPER_ADMIN: Tous les droits
// ADMIN_MAIRIE: Gérer sa mairie uniquement
// AGENT_MAIRIE: Créer/Modifier (pas supprimer)
```

3. **Tableau des mariages:**
- Colonnes: 
  - ID
  - Date de demande
  - Époux (Nom complet)
  - Épouse (Nom complet)
  - Mairie
  - Statut (badge coloré)
  - Actions (Voir, Modifier, Supprimer, Générer PDF)
- Tri par colonne
- Pagination (10, 25, 50 par page)
- Export CSV

4. **Bouton "Nouveau Mariage":**
- Visible uniquement pour ADMIN et AGENT
- Ouvre un modal ou redirige vers `/marriages/new`

---

### PAGE 4: Formulaire de Mariage (src/pages/NewMarriagePage.tsx)

**Étapes du formulaire (Stepper):**

#### **Étape 1: Informations de l'Époux**
```typescript
interface SpouseInfo {
  firstName: string;        // Required
  lastName: string;         // Required
  birthDate: Date;          // Required, > 18 ans
  birthPlace: string;       // Required
  nationality: string;      // Default: "Camerounaise"
  profession: string;       // Required
  address: string;          // Required
  fatherName: string;       // Required
  motherName: string;       // Required
  idCardNumber: string;     // Required, format: XXXXXXXX
}
```

#### **Étape 2: Informations de l'Épouse**
- Mêmes champs que l'époux

#### **Étape 3: Informations du Mariage**
```typescript
interface MarriageInfo {
  townHallId: number;       // Select des mairies disponibles
  marriageDate: Date;       // Date souhaitée (future)
  regime: 'separation' | 'community'; // Régime matrimonial
  witnesses: Witness[];     // 4 témoins obligatoires
}

interface Witness {
  fullName: string;
  idCardNumber: string;
  address: string;
}
```

#### **Étape 4: Documents (optionnel pour MVP)**
```typescript
interface Documents {
  spouseIdCard: File;       // CNI époux
  wifeIdCard: File;         // CNI épouse
  birthCertificates: File[];
}
```

**Validation:**
- Toutes les étapes doivent être valides
- Vérification âge minimum (18 ans)
- Format CNI: 8 chiffres
- Date de mariage dans le futur
- 4 témoins obligatoires

**Boutons de navigation:**
- "Précédent", "Suivant", "Enregistrer comme brouillon", "Soumettre"

**API Call:**
```typescript
POST /api/marriages
Body: {
  spouse: { /* données époux */ },
  wife: { /* données épouse */ },
  townHallId: number,
  marriageDate: string,
  regime: string,
  witnesses: [ /* 4 témoins */ ]
}
```

---

### PAGE 5: Détails d'un Mariage (src/pages/MarriageDetailPage.tsx)

**Sections:**

1. **Header:**
   - Titre: "Mariage n°{id}"
   - Badge de statut (pending/approved/rejected)
   - Boutons d'action selon le rôle:
     - ADMIN: "Approuver", "Rejeter", "Générer PDF"
     - AGENT: "Modifier"

2. **Informations de l'Époux:**
   - Card avec toutes les données
   - Icône utilisateur

3. **Informations de l'Épouse:**
   - Card similaire à l'époux

4. **Informations du Mariage:**
   - Date de demande
   - Date de célébration
   - Mairie
   - Régime matrimonial
   - Liste des témoins

5. **Historique des actions:**
   - Timeline des modifications
   - Qui a créé, modifié, approuvé/rejeté

6. **Actions:**
   - Bouton "Générer l'Acte PDF" (si statut = approved)
   - Modal de prévisualisation PDF
   - Téléchargement du PDF

---

## 📑 GÉNÉRATION DES ACTES PDF

### Composant ActePDFGenerator (src/components/pdf/ActePDFGenerator.tsx)

**Spécifications du PDF:**

1. **En-tête:**
   - Logo République du Cameroun
   - "ACTE DE MARIAGE N° {id}"
   - Date de génération

2. **Corps:**
```
Le {date}, à {heure}, à la mairie de {townHall.name},

Devant nous, {officierEtatCivil}, officier de l'état civil,

Ont comparu:

ÉPOUX:
- Nom: {spouse.lastName}
- Prénom: {spouse.firstName}
- Né le: {spouse.birthDate} à {spouse.birthPlace}
- Nationalité: {spouse.nationality}
- Profession: {spouse.profession}
- Domicilié: {spouse.address}
- Fils de: {spouse.fatherName} et {spouse.motherName}

ÉPOUSE:
- Nom: {wife.lastName}
- Prénom: {wife.firstName}
- Née le: {wife.birthDate} à {wife.birthPlace}
- Nationalité: {wife.nationality}
- Profession: {wife.profession}
- Domiciliée: {wife.address}
- Fille de: {wife.fatherName} et {wife.motherName}

TÉMOINS:
1. {witness1.fullName}, CNI: {witness1.idCardNumber}
2. {witness2.fullName}, CNI: {witness2.idCardNumber}
3. {witness3.fullName}, CNI: {witness3.idCardNumber}
4. {witness4.fullName}, CNI: {witness4.idCardNumber}

Régime matrimonial: {regime}

En foi de quoi, nous avons dressé le présent acte.
```

3. **Pied de page:**
   - Signature de l'officier d'état civil
   - Cachet de la mairie
   - Date et lieu

**Bibliothèque à utiliser:**
- `jsPDF` pour la génération
- `html2canvas` si besoin de rendu HTML

**Fonctionnalités:**
- Prévisualisation dans un modal
- Téléchargement (bouton "Télécharger PDF")
- Impression directe

---

## 🎨 DESIGN SYSTEM

### Palette de Couleurs
```css
:root {
  /* Couleurs Cameroun */
  --cameroon-green: #007A3D;
  --cameroon-red: #CE1126;
  --cameroon-yellow: #FCD116;
  
  /* Statuts */
  --status-pending: #F59E0B;    /* Orange */
  --status-approved: #10B981;   /* Vert */
  --status-rejected: #EF4444;   /* Rouge */
  
  /* UI */
  --primary: #007A3D;
  --secondary: #6B7280;
  --background: #F9FAFB;
  --surface: #FFFFFF;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border: #E5E7EB;
}
```

### Composants shadcn/ui à utiliser
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add form
```

### Typography
```css
/* Headings */
h1 { @apply text-4xl font-bold text-gray-900; }
h2 { @apply text-3xl font-semibold text-gray-800; }
h3 { @apply text-2xl font-semibold text-gray-800; }

/* Body */
p { @apply text-base text-gray-600; }
```

---

## 🧭 ROUTING

### Configuration (src/router.tsx)
```typescript
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'marriages',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <MarriagesPage />
              </ProtectedRoute>
            )
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_MAIRIE', 'AGENT_MAIRIE']}>
                <NewMarriagePage />
              </ProtectedRoute>
            )
          },
          {
            path: ':id',
            element: (
              <ProtectedRoute>
                <MarriageDetailPage />
              </ProtectedRoute>
            )
          }
        ]
      },
      {
        path: 'town-halls',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <TownHallsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN_MAIRIE']}>
            <UsersPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
```

---

## 🔌 ENDPOINTS API

### Documentation des endpoints à utiliser

#### **Authentification**
```typescript
POST /api/auth/login
Body: { email: string, password: string }
Response: { success: boolean, data: { user: User, token: string } }

POST /api/auth/logout
Headers: { Authorization: "Bearer {token}" }
Response: { success: boolean }

GET /api/auth/me
Headers: { Authorization: "Bearer {token}" }
Response: { success: boolean, data: { user: User } }
```

#### **Mariages**
```typescript
GET /api/marriages
Query: { page?, limit?, search?, status?, townHallId? }
Response: { success: boolean, data: Marriage[], meta: { total, page, limit } }

GET /api/marriages/:id
Response: { success: boolean, data: Marriage }

POST /api/marriages
Body: { spouse, wife, townHallId, marriageDate, regime, witnesses }
Response: { success: boolean, data: Marriage }

PUT /api/marriages/:id
Body: { /* champs à modifier */ }
Response: { success: boolean, data: Marriage }

DELETE /api/marriages/:id
Response: { success: boolean }

PATCH /api/marriages/:id/approve
Response: { success: boolean, data: Marriage }

PATCH /api/marriages/:id/reject
Body: { reason: string }
Response: { success: boolean, data: Marriage }

GET /api/marriages/:id/pdf
Response: Blob (PDF file)
```

#### **Mairies**
```typescript
GET /api/town-halls
Response: { success: boolean, data: TownHall[] }

GET /api/town-halls/:id
Response: { success: boolean, data: TownHall }

POST /api/town-halls (SUPER_ADMIN uniquement)
Body: { name, address, city, phone, email }
Response: { success: boolean, data: TownHall }
```

#### **Utilisateurs**
```typescript
GET /api/users
Response: { success: boolean, data: User[] }

POST /api/users (SUPER_ADMIN uniquement)
Body: { email, password, firstName, lastName, role, townHallId? }
Response: { success: boolean, data: User }
```

---

## ✅ CHECKLIST DE DÉVELOPPEMENT

### Phase 1: Setup (Jour 1)
- [ ] Initialiser le projet Vite + React + TypeScript
- [ ] Installer toutes les dépendances
- [ ] Configurer Tailwind CSS
- [ ] Installer shadcn/ui
- [ ] Créer la structure de dossiers
- [ ] Configurer Axios avec intercepteurs
- [ ] Créer le store Zustand pour l'auth

### Phase 2: Authentification (Jour 1-2)
- [ ] Page de login avec formulaire
- [ ] Validation Zod
- [ ] Intégration API login
- [ ] Store d'authentification persistant
- [ ] Composant ProtectedRoute
- [ ] Gestion des erreurs 401

### Phase 3: Layout & Navigation (Jour 2)
- [ ] Layout principal avec sidebar
- [ ] Navbar avec user dropdown
- [ ] Sidebar avec navigation selon rôle
- [ ] Responsive design
- [ ] Logo et branding Cameroun

### Phase 4: Dashboard (Jour 3)
- [ ] Cards de statistiques
- [ ] Graphique des mariages (Recharts)
- [ ] Tableau des derniers mariages
- [ ] Appels API pour les données
- [ ] Loading states
- [ ] Error handling

### Phase 5: Gestion des Mariages (Jour 4-5)
- [ ] Page liste avec tableau
- [ ] Filtres et recherche
- [ ] Pagination
- [ ] Actions selon le rôle
- [ ] Modal de confirmation suppression
- [ ] Formulaire de création (stepper)
- [ ] Validation complète
- [ ] Intégration API CRUD

### Phase 6: Détails & PDF (Jour 6)
- [ ] Page détails d'un mariage
- [ ] Actions (approuver/rejeter)
- [ ] Génération PDF avec jsPDF
- [ ] Modal de prévisualisation
- [ ] Téléchargement du PDF
- [ ] Historique des actions

### Phase 7: Pages Admin (Jour 7)
- [ ] Gestion des mairies (SUPER_ADMIN)
- [ ] Gestion des utilisateurs
- [ ] Formulaires CRUD
- [ ] Permissions selon rôle

### Phase 8: Finitions (Jour 8)
- [ ] Tests manuels de tous les flux
- [ ] Notifications toast
- [ ] Messages d'erreur clairs
- [ ] Loading spinners partout
- [ ] Optimisation performances
- [ ] Documentation du code

---

## 🚨 RÈGLES IMPORTANTES

### 1. Gestion des Erreurs
```typescript
// TOUJOURS utiliser try/catch pour les appels API
try {
  const response = await apiClient.get('/marriages');
  // Traiter les données
} catch (error) {
  if (axios.isAxiosError(error)) {
    toast.error(error.response?.data?.message || 'Une erreur est survenue');
  }
}
```

### 2. Loading States
```typescript
// TOUJOURS avoir un état de chargement
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    // API call
  } finally {
    setIsLoading(false);
  }
};
```

### 3. TypeScript Strict
```typescript
// TOUJOURS typer les données
interface Marriage {
  id: number;
  spouse: Person;
  wife: Person;
  status: 'pending' | 'approved' | 'rejected';
  // ...
}

// Pas de 'any'
// Utiliser 'unknown' si type incertain puis vérifier
```

### 4. Accessibilité
- Tous les formulaires doivent avoir des labels
- Utiliser les attributs ARIA
- Navigation au clavier fonctionnelle
- Contraste de couleurs suffisant

### 5. Performance
- Lazy loading des routes
- Memoization avec useMemo/useCallback
- Pagination obligatoire pour les listes
- Optimistic UI pour les actions rapides

---

## 📦 COMMANDES D'INSTALLATION

```bash
# Créer le projet
npm create vite@latest mariage-frontend -- --template react-ts
cd mariage-frontend

# Dépendances principales
npm install react-router-dom axios zustand
npm install @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
npm install jspdf html2canvas
npm install recharts
npm install lucide-react
npm install react-hot-toast

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn-ui@latest init

# Dev dependencies
npm install -D @types/node
```

---

## 🎯 LIVRABLES ATTENDUS

1. **Code source complet** avec tous les fichiers demandés
2. **README.md** avec instructions de lancement
3. **Documentation** des composants principaux
4. **Captures d'écran** de toutes les pages
5. **Video démo** du flux complet (optionnel)

---

## 📝 NOTES FINALES

- **Priorité 1**: Authentification + Dashboard + CRUD Mariages
- **Priorité 2**: Génération PDF + Gestion des rôles
- **Priorité 3**: Admin pages (mairies, utilisateurs)

**Date limite**: 8 jours de développement

**Contact**: Si besoin de clarifications sur l'API backend, demander des exemples de réponses JSON.

---

## 🔥 POINTS CRITIQUES À VÉRIFIER

1. ✅ Token JWT bien stocké et envoyé dans les headers
2. ✅ Redirection après login fonctionne
3. ✅ Logout déconnecte bien et vide le store
4. ✅ Routes protégées bloquent les non-authentifiés
5. ✅ Permissions respectées selon le rôle
6. ✅ Validation des formulaires complète
7. ✅ Messages d'erreur clairs et en français
8. ✅ PDF généré conforme au modèle légal
9. ✅ Responsive design sur mobile/tablette
10. ✅ Pas de données sensibles exposées

---

**FIN DE LA COMMANDE**

Bon courage pour le développement ! 🚀