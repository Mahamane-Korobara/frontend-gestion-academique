'use client';

import { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

// UI & Layout
import ListPageLayout from '@/components/partage/ListPageLayout';
import TabNavigation from '@/components/partage/TabNavigation';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTableSection from '@/components/partage/DataTableSection';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

// Hooks
import useApi from '@/lib/hooks/useApi';
import { professeurAPI } from '@/lib/api/endpoints';

// Icons
import { ClipboardCheck, Users } from 'lucide-react';

export default function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Récupérer les données des cours (qui incluent les évaluations et notes)
  const { data: mesCours = [], loading } = useApi(() => professeurAPI.getMesCours());

  // Construire la liste des évaluations à partir des cours
  const evaluations = useMemo(() => {
    const allEvals = [];
    mesCours.forEach(cours => {
      if (cours.evaluations && Array.isArray(cours.evaluations)) {
        cours.evaluations.forEach(evaluation => {
          allEvals.push({
            id: evaluation.id,
            libelle: evaluation.libelle,
            type: evaluation.type_evaluation?.nom || 'N/A',
            cours: cours,
            nb_notes_saisies: evaluation.nb_notes_saisies || 0,
            nb_notes_totales: evaluation.nb_notes_totales || 0,
            etat: evaluation.etat || 'en_cours',
          });
        });
      }
    });
    return allEvals;
  }, [mesCours]);

  // Filtrer les données
  const filteredData = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        evaluation.libelle?.toLowerCase().includes(searchLower) ||
        evaluation.cours?.titre?.toLowerCase().includes(searchLower);

      if (activeTab === 'all') return matchSearch;
      if (activeTab === 'en_cours') return matchSearch && evaluation.etat === 'en_cours';
      if (activeTab === 'validees') return matchSearch && evaluation.etat === 'validee';
      return matchSearch;
    });
  }, [evaluations, searchQuery, activeTab]);

  // Configuration des colonnes
  const columns = [
    {
      key: 'eval-titre',
      label: 'ÉVALUATION',
      className: 'min-w-[250px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">
              {row.libelle}
            </span>
            <span className="text-xs text-gray-500 truncate">
              {row.cours?.titre}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'eval-type',
      label: 'TYPE',
      className: 'min-w-[100px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge 
          label={row.type}
          variant="blue"
        />
      )
    },
    {
      key: 'eval-notes',
      label: 'NOTES SAISIES',
      className: 'min-w-[120px] hidden sm:table-cell',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(row.nb_notes_saisies / row.nb_notes_totales) * 100 || 0}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium whitespace-nowrap">
            {row.nb_notes_saisies}/{row.nb_notes_totales}
          </span>
        </div>
      )
    },
    {
      key: 'eval-statut',
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge 
          status={row.etat === 'validee' ? 'Validée' : 'En cours'} 
          variant={row.etat === 'validee' ? 'success' : 'warning'} 
        />
      )
    },
    {
      key: 'eval-actions',
      label: 'ACTIONS',
      className: 'w-[100px]',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              // TODO: Ouvrir modal de saisie des notes
              console.log('Saisir notes pour:', row.id);
            }}
          >
            Saisir
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header 
        title="Gestion des Notes" 
        description="Saisissez et validez les notes de vos étudiants"
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <ListPageLayout
          title="Gestion des Notes"
          description="Saisie et validation des notes"
        >
          {/* Onglets */}
          <div className="mb-6">
            <TabNavigation
              tabs={[
                { id: 'all', label: 'Toutes', count: evaluations.length },
                { 
                  id: 'en_cours', 
                  label: 'En cours', 
                  count: evaluations.filter(e => e.etat === 'en_cours').length 
                },
                { 
                  id: 'validees', 
                  label: 'Validées', 
                  count: evaluations.filter(e => e.etat === 'validee').length 
                }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher par évaluation ou cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Alerte */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Note: Les notes doivent être validées avant d'être vues par les étudiants.
              </p>
            </div>
          </div>

          {/* Tableau des évaluations */}
          <DataTableSection
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="Aucune évaluation trouvée"
          />
        </ListPageLayout>
      </main>
    </div>
  );
}
