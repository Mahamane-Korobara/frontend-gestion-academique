'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import TabNavigation from '@/components/partage/TabNavigation';
import InfoBadge from '@/components/ui/InfoBadge';
import StatusBadge from '@/components/ui/StatusBadge';
import DataTableSection from '@/components/partage/DataTableSection';
import AnnoncesSection from '@/components/annonces/AnnoncesSection';

// Hooks
import useApi from '@/lib/hooks/useApi';
import { annoncesProfesseurAPI } from '@/lib/api/endpoints';
import Header from '@/components/layout/Header';

// Helpers
import {
  getPriorityIcon,
  getCibleText,
} from '@/lib/utils/annonceHelpers';
import { formatDate } from '@/lib/utils/format';

export default function ProfesseurAnnoncesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: annonces = [], loading } = useApi(() => annoncesProfesseurAPI.getAll());

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!Array.isArray(annonces)) return [];
    
    return annonces.filter((annonce) => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        annonce.titre?.toLowerCase().includes(searchLower) ||
        annonce.contenu?.toLowerCase().includes(searchLower);

      if (activeTab === 'all') return matchSearch;
      if (activeTab === 'envoyees') return matchSearch && annonce.is_active;
      if (activeTab === 'brouillons') return matchSearch && !annonce.is_active;
      return matchSearch;
    });
  }, [annonces, searchQuery, activeTab]);

  // Configuration des colonnes
  const columns = [
    {
      key: 'annonce-sujet',
      label: 'SUJET',
      className: 'min-w-[280px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center text-xl">
            {getPriorityIcon(row.priorite)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">
              {row.titre}
            </span>
            <span className="text-xs text-gray-500 truncate line-clamp-1">
              {row.contenu}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {formatDate(row.created_at, 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'annonce-cible',
      label: 'CIBLE',
      className: 'min-w-[140px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge 
          label={getCibleText(row.cible)} 
          variant="blue"
        />
      )
    },
    {
      key: 'annonce-statut',
      label: 'STATUT',
      className: 'min-w-[100px] hidden sm:table-cell',
      render: (_, row) => (
        <StatusBadge 
          status={row.is_active ? 'Envoyé' : 'Brouillon'} 
          variant={row.is_active ? 'success' : 'warning'} 
        />
      )
    },
    {
      key: 'annonce-actions',
      label: 'ACTIONS',
      className: 'w-[100px]',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Link href={`/professeur/annonces/${row.id}`}>
            <Button size="sm" variant="outline">
              Voir
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div>
      <Header 
        title="Mes Annonces" 
        description="Gérez les annonces pour vos étudiants"
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <ListPageLayout
          title="Mes Annonces"
          description="Publiez et gérez vos annonces"
          actionButton={
            <Link href="/professeur/annonces/nouveau">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" /> Nouvelle Annonce
              </Button>
            </Link>
          }
        >
          {/* Onglets */}
          <div className="mb-6">
            <TabNavigation
              tabs={[
                { id: 'all', label: 'Tous', count: annonces.length },
                { 
                  id: 'envoyees', 
                  label: 'Envoyées', 
                  count: annonces.filter(a => a.is_active).length 
                },
                { 
                  id: 'brouillons', 
                  label: 'Brouillons', 
                  count: annonces.filter(a => !a.is_active).length 
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
              placeholder="Rechercher par titre ou contenu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tableau des annonces */}
          <DataTableSection
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="Aucune annonce trouvée"
          />
        </ListPageLayout>
      </main>
    </div>
  );
}
