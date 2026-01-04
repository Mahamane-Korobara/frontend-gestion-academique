# 📁 Architecture Complète - Frontend Next.js

```
frontend-gestion-academique/
│
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── (auth)/                            # Routes publiques
│   │   │   ├── login/
│   │   │   │   └── page.jsx                   # Page login
│   │   │   └── layout.jsx                     # Layout auth (sans sidebar)
│   │   │
│   │   ├── (admin)/                           # Routes admin
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── utilisateurs/
│   │   │   │   ├── page.jsx                   # Liste
│   │   │   │   ├── nouveau/page.jsx           # Créer
│   │   │   │   └── [id]/page.jsx              # Détails/Modifier
│   │   │   ├── filieres/
│   │   │   │   ├── page.jsx
│   │   │   │   ├── nouveau/page.jsx
│   │   │   │   └── [id]/page.jsx
│   │   │   ├── niveaux/page.jsx
│   │   │   ├── cours/
│   │   │   │   ├── page.jsx
│   │   │   │   ├── nouveau/page.jsx
│   │   │   │   └── [id]/page.jsx
│   │   │   ├── annees-academiques/page.jsx
│   │   │   ├── semestres/page.jsx
│   │   │   ├── inscriptions/page.jsx
│   │   │   ├── evaluations/page.jsx
│   │   │   ├── notes/
│   │   │   │   ├── page.jsx
│   │   │   │   └── validation/page.jsx
│   │   │   ├── bulletins/page.jsx
│   │   │   ├── emploi-du-temps/page.jsx
│   │   │   ├── annonces/
│   │   │   │   ├── page.jsx
│   │   │   │   └── nouveau/page.jsx
│   │   │   ├── messages/page.jsx
│   │   │   ├── documents/page.jsx
│   │   │   ├── rapports/page.jsx
│   │   │   ├── parametres/page.jsx
│   │   │   └── layout.jsx                     # Layout admin (avec sidebar)
│   │   │
│   │   ├── (professeur)/                      # Routes professeur
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── mes-cours/page.jsx
│   │   │   ├── notes/
│   │   │   │   └── saisie/
│   │   │   │       └── [evaluationId]/page.jsx
│   │   │   ├── emploi-du-temps/page.jsx
│   │   │   ├── annonces/page.jsx
│   │   │   ├── messages/page.jsx
│   │   │   ├── documents/page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── (etudiant)/                        # Routes étudiant
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── mes-notes/page.jsx
│   │   │   ├── mes-bulletins/page.jsx
│   │   │   ├── mes-cours/page.jsx
│   │   │   ├── emploi-du-temps/page.jsx
│   │   │   ├── annonces/page.jsx
│   │   │   ├── messages/page.jsx
│   │   │   ├── documents/page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── layout.jsx                         # Layout racine
│   │   ├── globals.css                        # Styles globaux
│   │   └── not-found.jsx                      # Page 404
│   │
│   ├── components/                            # Composants réutilisables
│   │   ├── ui/                               # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── table.jsx
│   │   │   └── ... (composants shadcn)
│   │   │
│   │   ├── layout/                           # Layout components
│   │   │   ├── Sidebar.jsx                   # Menu latéral
│   │   │   ├── Header.jsx                    # En-tête
│   │   │   ├── MobileNav.jsx                 # Navigation mobile
│   │   │   └── UserMenu.jsx                  # Menu utilisateur
│   │   │
│   │   ├── shared/                           # Composants partagés
│   │   │   ├── DataTable.jsx                 # Table générique
│   │   │   ├── SearchBar.jsx                 # Barre de recherche
│   │   │   ├── Pagination.jsx                # Pagination
│   │   │   ├── LoadingSpinner.jsx            # Chargement
│   │   │   ├── EmptyState.jsx                # État vide
│   │   │   ├── ErrorAlert.jsx                # Alerte erreur
│   │   │   └── ConfirmDialog.jsx             # Dialogue confirmation
│   │   │
│   │   ├── dashboard/                        # Composants dashboard
│   │   │   ├── StatsCard.jsx                 # Carte statistique
│   │   │   ├── RecentActivity.jsx            # Activité récente
│   │   │   ├── QuickActions.jsx              # Actions rapides
│   │   │   └── ChartCard.jsx                 # Carte graphique
│   │   │
│   │   ├── forms/                            # Composants formulaires
│   │   │   ├── FormInput.jsx                 # Input
│   │   │   ├── FormSelect.jsx                # Select
│   │   │   ├── FormTextarea.jsx              # Textarea
│   │   │   ├── FormDatePicker.jsx            # Date picker
│   │   │   ├── FormMultiSelect.jsx           # Multi select
│   │   │   └── FormCheckbox.jsx              # Checkbox
│   │   │
│   │   ├── calendar/                         # Emploi du temps
│   │   │   ├── EmploiDuTemps.jsx            # Calendrier principal
│   │   │   ├── EventCard.jsx                 # Carte événement
│   │   │   └── CalendarLegend.jsx            # Légende
│   │   │
│   │   ├── editor/                           # Éditeur texte riche
│   │   │   ├── RichTextEditor.jsx            # Éditeur TipTap
│   │   │   └── EditorToolbar.jsx             # Barre d'outils
│   │   │
│   │   └── charts/                           # Graphiques
│   │       ├── PieChart.jsx
│   │       ├── BarChart.jsx
│   │       └── LineChart.jsx
│   │
│   ├── lib/                                  # Logique métier
│   │   ├── api/                             # Client API
│   │   │   ├── client.js                     # Configuration fetch
│   │   │   ├── endpoints.js                  # Tous les endpoints
│   │   │   └── interceptors.js               # Gestion erreurs/token
│   │   │
│   │   ├── hooks/                           # Custom hooks
│   │   │   ├── useAuth.js                    # Hook auth
│   │   │   ├── useApi.js                     # Hook API générique
│   │   │   ├── usePagination.js              # Hook pagination
│   │   │   ├── useDebounce.js                # Hook debounce
│   │   │   ├── useToast.js                   # Hook notifications
│   │   │   └── useForm.js                    # Hook formulaires
│   │   │
│   │   ├── store/                           # State management (Zustand)
│   │   │   ├── authStore.js                  # Store auth
│   │   │   ├── uiStore.js                    # Store UI
│   │   │   └── notificationStore.js          # Store notifications
│   │   │
│   │   ├── utils/                           # Utilitaires
│   │   │   ├── cn.js                         # Merge classes CSS
│   │   │   ├── format.js                     # Formatage dates/nombres
│   │   │   ├── constants.js                  # Constantes
│   │   │   ├── validators.js                 # Validations
│   │   │   └── helpers.js                    # Helpers
│   │   │
│   │   └── styles/                          # Styles réutilisables
│   │       └── common.js                     # Classes communes
│   │
│   └── middleware.js                         # Middleware Next.js
│
├── public/                                   # Fichiers statiques
│   ├── images/
│   │   └── logo.svg
│   └── fonts/
│
├── .env.local                                # Variables d'environnement
├── .env.example
├── .gitignore
├── .prettierrc                               # Config Prettier
├── jsconfig.json                             # Config JavaScript
├── package.json
└── README.md
```

## 🎯 Principes d'Architecture

### 1. **Pas de Répétition (DRY)**

- Tous les appels API dans `lib/api/endpoints.js`
- Hooks réutilisables dans `lib/hooks/`
- Composants génériques dans `components/shared/`

### 2. **Performance**

- Composants client (`'use client'`) uniquement quand nécessaire
- Lazy loading des composants lourds
- Cache avec Zustand pour éviter requêtes inutiles

### 3. **Maintenabilité**

- Un fichier = Une responsabilité
- Nomenclature claire et cohérente
- Structure miroir des routes API backend

### 4. **Responsive**

- Mobile-first avec Tailwind
- Sidebar collapsible
- Tables scrollables horizontalement
