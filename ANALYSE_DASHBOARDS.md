# Analyse des Dashboards Admin et Professeur

## 📋 Vue d'ensemble

Cette analyse examine l'architecture et l'implémentation des dashboards pour les rôles **Admin** et **Professeur**, en se concentrant sur les endpoints, services, hooks et composants associés.

---

## 🔗 1. ENDPOINTS (endpoints.js)

### 1.1 Dashboard Admin
```167:169:src/lib/api/endpoints.js
export const dashboardAdminAPI = {
    getStats: () => apiClient.get('/admin/dashboard'),
};
```

**Endpoint:** `GET /admin/dashboard`
- **Rôle:** Récupère toutes les statistiques du dashboard administrateur
- **Retour attendu:** Objet contenant filtres, résumé, graphiques, données académiques, activités récentes et alertes

### 1.2 Dashboard Professeur
```174:178:src/lib/api/endpoints.js
export const professeurAPI = {
    getDashboard: () => apiClient.get('/professeur/dashboard'),
    getMesCours: () => apiClient.get('/professeur/cours'),
    saisirNotes: (evaluationId, data) => apiClient.post(`/professeur/evaluations/${evaluationId}/notes`, data),
};
```

**Endpoint:** `GET /professeur/dashboard`
- **Rôle:** Récupère les statistiques spécifiques au professeur
- **Retour attendu:** Mes cours, emploi du temps, notes, année académique, résumé, activités récentes et alertes

---

## 🛠️ 2. SERVICES

### 2.1 Dashboard Service (Admin)
```1:20:src/lib/services/dashboard.service.js
/**
 * Service pour le tableau de bord admin
 */

import apiClient from '@/lib/api/client';

export const dashboardService = {
    /**
     * Récupérer les statistiques complètes du dashboard
     * Retourne: filtres, résumé, charts, données académiques, activités, alertes
     */
    getStats: () => apiClient.get('/admin/dashboard'),

    /**
     * Récupérer les statistiques avec des filtres
     */
    getStatsByFilters: (filters) => {
        return apiClient.get('/admin/dashboard', filters);
    },
};
```

**Fonctionnalités:**
- `getStats()`: Récupère les stats sans filtres
- `getStatsByFilters(filters)`: Récupère les stats avec filtres (année, semestre, filière, niveau)

**Note:** La méthode `getStatsByFilters` est définie mais **non utilisée** dans le hook `useDashboard`.

---

## 🎣 3. HOOKS

### 3.1 useDashboard (Admin)
```1:51:src/lib/hooks/useDashboard.js
'use client';

import { useState, useCallback } from 'react';
import { dashboardService } from '@/lib/services/dashboard.service';
import useApi from './useApi';

export const useDashboard = () => {
    const [filters, setFilters] = useState({
        anneeId: null,
        semestreId: null,
        filiereId: null,
        niveauId: null,
    });

    // Utiliser useApi pour gérer l'état du dashboard
    const {
        data: dashboardData,
        loading,
        error,
        execute
    } = useApi(dashboardService.getStats);

    // Appliquer les filtres
    const applyFilters = useCallback(async (newFilters) => {
        setFilters(newFilters);
        // Optionnel: refetch avec les nouveaux filtres
        // await execute(newFilters);
    }, []);

    // Structure les données retournées
    const structured = dashboardData ? {
        filtresAppliques: dashboardData.filtres_appliques || {},
        filtresDisponibles: dashboardData.filtres_disponibles || {},
        anneeAcademique: dashboardData.annee_academique || {},
        resume: dashboardData.resume || {},
        charts: dashboardData.charts || {},
        academique: dashboardData.academique || {},
        recentActivities: dashboardData.recent_activities || [],
        alerts: dashboardData.alerts || [],
        lastUpdated: dashboardData.last_updated,
    } : null;

    return {
        dashboard: structured,
        loading,
        error,
        refetch: execute,
        filters,
        applyFilters,
    };
};

export default useDashboard;
```

**Structure des données retournées:**
- `filtresAppliques`: Filtres actuellement appliqués
- `filtresDisponibles`: Options de filtres disponibles
- `anneeAcademique`: Informations sur l'année académique active
- `resume`: Statistiques principales (étudiants, professeurs, cours, etc.)
- `charts`: Données pour les graphiques
- `academique`: Données académiques (moyennes, taux de réussite, etc.)
- `recentActivities`: Liste des activités récentes
- `alerts`: Alertes et notifications
- `lastUpdated`: Date de dernière mise à jour

**⚠️ Problème identifié:**
- La fonction `applyFilters` met à jour l'état local mais **ne refetch pas les données** (ligne 27 commentée)
- La méthode `getStatsByFilters` du service n'est jamais utilisée

### 3.2 useProfesseurDashboard
```1:48:src/lib/hooks/useProfesseurDashboard.js
'use client';

import { useState, useCallback } from 'react';
import { professeurAPI } from '@/lib/api/endpoints';
import useApi from './useApi';

export const useProfesseurDashboard = () => {
    const [filters, setFilters] => useState({
        semestreId: null,
        niveauId: null,
    });

    // Utiliser useApi pour gérer l'état du dashboard
    const {
        data: dashboardData,
        loading,
        error,
        execute
    } = useApi(professeurAPI.getDashboard);

    // Appliquer les filtres
    const applyFilters = useCallback(async (newFilters) => {
        setFilters(newFilters);
    }, []);

    // Structure les données retournées
    const structured = dashboardData ? {
        mesCours: dashboardData.mes_cours || [],
        emploiDuTemps: dashboardData.emploi_du_temps || {},
        notes: dashboardData.notes || {},
        anneeAcademique: dashboardData.annee_academique || {},
        resume: dashboardData.resume || {},
        recentActivities: dashboardData.recent_activities || [],
        alerts: dashboardData.alerts || [],
        lastUpdated: dashboardData.last_updated,
    } : null;

    return {
        dashboard: structured,
        loading,
        error,
        refetch: execute,
        filters,
        applyFilters,
    };
};

export default useProfesseurDashboard;
```

**Structure des données retournées:**
- `mesCours`: Liste des cours assignés au professeur
- `emploiDuTemps`: Informations sur l'emploi du temps
- `notes`: Statistiques sur les notes (total, validées, en attente)
- `anneeAcademique`: Informations sur l'année académique
- `resume`: Statistiques résumées (cours enseignés, étudiants, évaluations, taux de validation)
- `recentActivities`: Activités récentes
- `alerts`: Alertes
- `lastUpdated`: Date de dernière mise à jour

**⚠️ Problème identifié:**
- Même problème que `useDashboard`: `applyFilters` ne refetch pas les données

---

## 📄 4. PAGES

### 4.1 Page Dashboard Admin
```1:58:src/app/(admin)/dashboard/page.jsx
// src/app/(admin)/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import useDashboard from '@/lib/hooks/useDashboard';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardAcademique from '@/components/dashboard/DashboardAcademique';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import Header from '@/components/layout/Header';

export default function AdminDashboard() {
  const { dashboard, loading, error, refetch } = useDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Afficher les états de chargement et erreur
  if (loading || error || !dashboard) {
    return <DashboardLoadingState isLoading={loading} isError={error || !dashboard} />;
  }

  const { resume, charts, academique, recentActivities, alerts, anneeAcademique } = dashboard;

  return (
    <div>
      <Header 
        title="Vue d'ensemble du tableau de bord" 
        description={`${anneeAcademique?.annee} - ${anneeAcademique?.semestre_actif}`}
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        {/* Alertes avec appels à l'action */}
      <DashboardAlerts alerts={alerts} />

      {/* Actions Rapides */}
      <DashboardQuickActions />

      {/* Statistiques principales */}
      <DashboardStats resume={resume} />

      {/* Données académiques */}
      <DashboardAcademique academique={academique} />

      {/* Graphiques */}
      <DashboardCharts charts={charts} />

      {/* Activités Récentes */}
      {recentActivities && recentActivities.length > 0 && (
        <RecentActivity activities={recentActivities} />
      )}
      </main>
    </div>
  );
}
```

**Composants utilisés:**
1. `DashboardAlerts`: Affiche les alertes
2. `DashboardQuickActions`: Actions rapides
3. `DashboardStats`: Statistiques principales (5 cartes)
4. `DashboardAcademique`: Données académiques (4 cartes)
5. `DashboardCharts`: Graphiques
6. `RecentActivity`: Activités récentes

### 4.2 Page Dashboard Professeur
```1:69:src/app/professeur/dashboard/page.jsx
'use client';

import { useEffect } from 'react';
import useProfesseurDashboard from '@/lib/hooks/useProfesseurDashboard';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardAlerts from '@/components/dashboard/DashboardAlerts';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';
import DashboardProfesseurStats from '@/components/dashboard/DashboardProfesseurStats';
import DashboardMesCours from '@/components/dashboard/DashboardMesCours';
import DashboardEmploiDuTemps from '@/components/dashboard/DashboardEmploiDuTemps';
import DashboardNotesATraiter from '@/components/dashboard/DashboardNotesATraiter';
import RecentActivity from '@/components/dashboard/RecentActivity';
import Header from '@/components/layout/Header';

export default function ProfesseurDashboard() {
  const { dashboard, loading, error, refetch } = useProfesseurDashboard();

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Afficher les états de chargement et erreur
  if (loading || error || !dashboard) {
    return <DashboardLoadingState isLoading={loading} isError={error || !dashboard} />;
  }

  const { 
    resume, 
    mesCours, 
    emploiDuTemps, 
    notes,
    recentActivities, 
    alerts, 
    anneeAcademique 
  } = dashboard;

  return (
    <div>
      <Header 
        title="Tableau de bord Professeur" 
        description={`${anneeAcademique?.annee || ''} - ${anneeAcademique?.semestre_actif || ''}`}
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        {/* Alertes avec appels à l'action */}
        <DashboardAlerts alerts={alerts} />

        {/* Actions Rapides */}
        {/* <DashboardQuickActions /> */}

        {/* Statistiques principales */}
        <DashboardProfesseurStats resume={resume} />

        {/* Mes Cours */}
        <DashboardMesCours mesCours={mesCours} />

        {/* Emploi du Temps */}
        <DashboardEmploiDuTemps emploiDuTemps={emploiDuTemps} />

        {/* Gestion des Notes */}
        <DashboardNotesATraiter notes={notes} />

        {/* Activités Récentes */}
        {recentActivities && recentActivities.length > 0 && (
          <RecentActivity activities={recentActivities} />
        )}
      </main>
    </div>
  );
}
```

**Composants utilisés:**
1. `DashboardAlerts`: Alertes
2. `DashboardQuickActions`: Commenté (non affiché)
3. `DashboardProfesseurStats`: Statistiques spécifiques au professeur (4 cartes)
4. `DashboardMesCours`: Liste des cours assignés
5. `DashboardEmploiDuTemps`: Emploi du temps
6. `DashboardNotesATraiter`: Gestion des notes en attente
7. `RecentActivity`: Activités récentes

---

## 🧩 5. COMPOSANTS DÉTAILLÉS

### 5.1 DashboardStats (Admin)
```1:48:src/components/dashboard/DashboardStats.jsx
'use client';

import { GraduationCap, Users, BookOpen, Network, ListChecks } from 'lucide-react';
import StatsCard from './StatsCard';

export default function DashboardStats({ resume = {} }) {
  const stats = [
    {
      title: 'Total Étudiants',
      value: resume.total_etudiants?.toLocaleString() || '0',
      subtitle: `${resume.etudiants_actifs || 0} actifs`,
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Professeurs',
      value: resume.total_professeurs?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Cours Actifs',
      value: resume.total_cours?.toLocaleString() || '0',
      icon: BookOpen,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Filières',
      value: resume.total_filieres?.toLocaleString() || '0',
      icon: Network,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Niveaux',
      value: resume.total_niveaux?.toLocaleString() || '0',
      icon: ListChecks,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, idx) => (
        <StatsCard key={idx} {...stat} />
      ))}
    </div>
  );
}
```

**Affiche:** 5 statistiques principales (Étudiants, Professeurs, Cours, Filières, Niveaux)

### 5.2 DashboardProfesseurStats
```1:51:src/components/dashboard/DashboardProfesseurStats.jsx
import React from 'react';
import StatsCard from './StatsCard';
import { BookMarked, Users, ClipboardCheck, TrendingUp } from 'lucide-react';

export default function DashboardProfesseurStats({ resume = {} }) {
  const stats = [
    {
      label: 'Mes Cours',
      value: resume.cours_enseignes || 0,
      icon: BookMarked,
      variant: 'blue',
      description: 'Cours assignés'
    },
    {
      label: 'Étudiants Totaux',
      value: resume.total_etudiants || 0,
      icon: Users,
      variant: 'purple',
      description: 'Inscrits à mes cours'
    },
    {
      label: 'Évaluations',
      value: resume.total_evaluations || 0,
      icon: ClipboardCheck,
      variant: 'green',
      description: 'À corriger'
    },
    {
      label: 'Taux de Validation',
      value: `${resume.taux_validation || 0}%`,
      icon: TrendingUp,
      variant: 'orange',
      description: 'Notes validées'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          variant={stat.variant}
          description={stat.description}
        />
      ))}
    </div>
  );
}
```

**Affiche:** 4 statistiques (Mes Cours, Étudiants, Évaluations, Taux de Validation)

### 5.3 DashboardAcademique (Admin)
```1:41:src/components/dashboard/DashboardAcademique.jsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardAcademique({ academique = {} }) {
  const data = [
    {
      label: 'Moyenne Générale',
      value: academique.moyenne_generale?.toFixed(2) || '0.00',
      subtitle: 'Sur 20',
    },
    {
      label: 'Taux de Réussite',
      value: `${academique.taux_reussite_global?.toFixed(1) || '0'}%`,
    },
    {
      label: 'Notes Saisies',
      value: academique.notes_saisies || '0',
    },
    {
      label: 'Bulletins Générés',
      value: academique.bulletins_genres || '0',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {data.map((item, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Affiche:** 4 métriques académiques (Moyenne, Taux de réussite, Notes saisies, Bulletins)

### 5.4 DashboardMesCours (Professeur)
```1:57:src/components/dashboard/DashboardMesCours.jsx
import React from 'react';
import { BookMarked, Users, Calendar, ClipboardCheck } from 'lucide-react';
import DashboardSection from './DashboardSection';

export default function DashboardMesCours({ mesCours = [] }) {
  if (!mesCours || mesCours.length === 0) {
    return (
      <DashboardSection title="Mes Cours">
        <div className="text-center py-8 text-gray-500">
          <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucun cours assigné</p>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Mes Cours">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mesCours.map((cours) => (
          <div
            key={cours.id}
            className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex-1 pr-2">
                {cours.titre}
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {cours.code}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {cours.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{cours.nb_etudiants || 0} étudiants</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{cours.semestre?.code || 'S1'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ClipboardCheck className="w-4 h-4" />
                <span>{cours.nb_evaluations || 0} évaluations</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
```

**Affiche:** Liste des cours avec détails (titre, code, description, nombre d'étudiants, semestre, évaluations)

### 5.5 DashboardNotesATraiter (Professeur)
```1:77:src/components/dashboard/DashboardNotesATraiter.jsx
import React from 'react';
import { ClipboardCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardSection from './DashboardSection';
import Link from 'next/link';

export default function DashboardNotesATraiter({ notes = {} }) {
  const evaluationsEnAttente = notes.en_attente || [];
  const totalNotes = notes.total || 0;
  const notesValidees = notes.validees || 0;

  return (
    <DashboardSection title="Gestion des Notes">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total de Notes</p>
              <p className="text-2xl font-bold text-blue-900">{totalNotes}</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Notes Validées</p>
              <p className="text-2xl font-bold text-green-900">{notesValidees}</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">En Attente</p>
              <p className="text-2xl font-bold text-red-900">{evaluationsEnAttente.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {evaluationsEnAttente.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Évaluations en Attente
            </h4>
            <div className="space-y-2">
              {evaluationsEnAttente.slice(0, 5).map((evaluation, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {evaluation.evaluation?.libelle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.cours?.titre} - {evaluation.nb_notes || 0} notes
                    </p>
                  </div>
                  <Link href="/professeur/notes">
                    <Button size="sm" variant="outline">
                      Corriger
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
      )}
    </DashboardSection>
  );
}
```

**Affiche:** 
- 3 statistiques (Total, Validées, En attente)
- Liste des 5 premières évaluations en attente avec lien vers la page de correction

---

## 🔧 6. CLIENT API

```1:186:src/lib/api/client.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Client API avec gestion automatique des tokens et erreurs
 */
class ApiClient {
    constructor() {
        this.baseURL = API_URL;
    }

    /**
     * Récupérer le token du localStorage
     */
    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    /**
     * Sauvegarder le token
     */
    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    /**
     * Supprimer le token
     */
    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    /**
     * Récupérer les headers par défaut
     */
    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...customHeaders,
        };

        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Gérer les réponses
     */
    async handleResponse(response) {
        // Si pas de contenu (204 No Content)
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        // Si erreur
        if (!response.ok) {
            // Token expiré ou invalide - Nettoyer le localStorage mais laisser le composant gérer la redirection
            if (response.status === 401) {
                this.removeToken();
            }

            throw {
                status: response.status,
                message: data.message || 'Une erreur est survenue',
                errors: data.errors || null,
            };
        }

        return data;
    }

    /**
     * GET Request
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);

        // Ajouter les query params
        Object.keys(params).forEach((key) => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * POST Request
     */
    async post(endpoint, body = {}, isFormData = false) {
        const headers = isFormData
            ? this.getHeaders({ 'Content-Type': 'multipart/form-data' })
            : this.getHeaders();

        // Supprimer Content-Type si FormData (le navigateur le gère)
        if (isFormData) {
            delete headers['Content-Type'];
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: isFormData ? body : JSON.stringify(body),
        });

        return this.handleResponse(response);
    }

    /**
     * PUT Request
     */
    async put(endpoint, body = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse(response);
    }

    /**
     * PATCH Request
     */
    async patch(endpoint, body = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        return this.handleResponse(response);
    }

    /**
     * DELETE Request
     */
    async delete(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        return this.handleResponse(response);
    }

    /**
     * Download File
     */
    async download(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Erreur lors du téléchargement');
        }

        return response.blob();
    }
}

// Instance unique du client
const apiClient = new ApiClient();

export default apiClient;
```

**Fonctionnalités:**
- Gestion automatique du token JWT
- Gestion des erreurs (401 = déconnexion automatique)
- Support des query params pour GET
- Support FormData pour POST
- Méthodes: GET, POST, PUT, PATCH, DELETE, download

---

## ⚠️ 7. PROBLÈMES IDENTIFIÉS

### 7.1 Filtres non fonctionnels
**Problème:** Les fonctions `applyFilters` dans `useDashboard` et `useProfesseurDashboard` mettent à jour l'état local mais ne refetch pas les données.

**Solution recommandée:**
```javascript
const applyFilters = useCallback(async (newFilters) => {
    setFilters(newFilters);
    await execute(newFilters); // Utiliser getStatsByFilters pour admin
}, [execute]);
```

### 7.2 Service non utilisé
**Problème:** La méthode `getStatsByFilters` dans `dashboardService` n'est jamais utilisée.

**Solution:** Soit l'utiliser dans `applyFilters`, soit la supprimer.

### 7.3 Hook useApi
```1:27:src/lib/hooks/useApi.js
// src/lib/hooks/useApi.js
import { useState, useCallback, useRef } from 'react';

export default function useApi(apiFunc) { // <--- Bien vérifier le "default"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mémoriser la fonction pour éviter les changements à chaque rendu
    const apiFuncRef = useRef(apiFunc);

    const execute = useCallback(async (...params) => {
        try {
            setLoading(true);
            const result = await apiFuncRef.current(...params);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
}
```

**Note:** Le hook utilise `useRef` pour mémoriser la fonction API, mais ne met pas à jour la référence si la fonction change. Cela pourrait causer des problèmes si la fonction API change dynamiquement.

---

## 📊 8. RÉSUMÉ DES DIFFÉRENCES

| Aspect | Admin Dashboard | Professeur Dashboard |
|--------|----------------|---------------------|
| **Endpoint** | `/admin/dashboard` | `/professeur/dashboard` |
| **Service** | `dashboardService.getStats()` | `professeurAPI.getDashboard()` |
| **Hook** | `useDashboard()` | `useProfesseurDashboard()` |
| **Statistiques** | 5 cartes (Étudiants, Profs, Cours, Filières, Niveaux) | 4 cartes (Cours, Étudiants, Évaluations, Taux) |
| **Données académiques** | Oui (4 métriques) | Non |
| **Graphiques** | Oui | Non |
| **Mes Cours** | Non | Oui |
| **Emploi du temps** | Non | Oui |
| **Gestion des notes** | Non | Oui |
| **Actions rapides** | Oui | Commenté |

---

## ✅ 9. RECOMMANDATIONS

1. **Implémenter les filtres:** Activer le refetch dans `applyFilters`
2. **Utiliser ou supprimer:** Décider si `getStatsByFilters` doit être utilisée
3. **Gérer les erreurs:** Ajouter une meilleure gestion d'erreurs dans les composants
4. **Optimisation:** Ajouter un système de cache pour éviter les appels API répétés
5. **Tests:** Ajouter des tests unitaires pour les hooks et services

---

## 📝 10. STRUCTURE DES DONNÉES ATTENDUES

### Admin Dashboard Response
```json
{
  "filtres_appliques": {},
  "filtres_disponibles": {},
  "annee_academique": {
    "annee": "2024-2025",
    "semestre_actif": "S1"
  },
  "resume": {
    "total_etudiants": 150,
    "etudiants_actifs": 145,
    "total_professeurs": 25,
    "total_cours": 50,
    "total_filieres": 5,
    "total_niveaux": 15
  },
  "charts": {},
  "academique": {
    "moyenne_generale": 14.5,
    "taux_reussite_global": 75.5,
    "notes_saisies": 1200,
    "bulletins_genres": 145
  },
  "recent_activities": [],
  "alerts": [],
  "last_updated": "2024-01-15T10:30:00Z"
}
```

### Professeur Dashboard Response
```json
{
  "mes_cours": [
    {
      "id": 1,
      "titre": "Mathématiques",
      "code": "MATH101",
      "description": "...",
      "nb_etudiants": 30,
      "semestre": { "code": "S1" },
      "nb_evaluations": 3
    }
  ],
  "emploi_du_temps": {},
  "notes": {
    "total": 150,
    "validees": 120,
    "en_attente": [
      {
        "evaluation": { "libelle": "Examen Final" },
        "cours": { "titre": "Mathématiques" },
        "nb_notes": 30
      }
    ]
  },
  "annee_academique": {
    "annee": "2024-2025",
    "semestre_actif": "S1"
  },
  "resume": {
    "cours_enseignes": 5,
    "total_etudiants": 150,
    "total_evaluations": 10,
    "taux_validation": 80
  },
  "recent_activities": [],
  "alerts": [],
  "last_updated": "2024-01-15T10:30:00Z"
}
```

---

*Analyse générée le: 2024-01-15*
