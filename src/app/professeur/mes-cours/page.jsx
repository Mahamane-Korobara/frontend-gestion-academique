'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// UI & Layout
import { Button } from '@/components/ui/button';
import ListPageLayout from '@/components/partage/ListPageLayout';
import TabNavigation from '@/components/partage/TabNavigation';
import InfoBadge from '@/components/ui/InfoBadge';
import DataTableSection from '@/components/partage/DataTableSection';

// Hooks
import useApi from '@/lib/hooks/useApi';
import { professeurAPI } from '@/lib/api/endpoints';
import Header from '@/components/layout/Header';

// Icons
import { BookMarked, Users, Clock, FileText } from 'lucide-react';

export default function MesCoursPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: mesCours = [], loading } = useApi(() => professeurAPI.getMesCours());

  // Filtrer les données
  const filteredData = useMemo(() => {
    if (!Array.isArray(mesCours)) return [];
    
    return mesCours.filter((cours) => {
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = 
        cours.titre?.toLowerCase().includes(searchLower) ||
        cours.code?.toLowerCase().includes(searchLower) ||
        cours.description?.toLowerCase().includes(searchLower);

      if (activeTab === 'all') return matchSearch;
      if (activeTab === 'actifs') return matchSearch && !cours.is_archived;
      if (activeTab === 'archives') return matchSearch && cours.is_archived;
      return matchSearch;
    });
  }, [mesCours, searchQuery, activeTab]);

  // Configuration des colonnes
  const columns = [
    {
      key: 'cours-titre',
      label: 'COURS',
      className: 'min-w-[250px]',
      render: (_, row) => (
        <div className="flex items-start gap-3 py-2">
          <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded text-blue-600">
            <BookMarked className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-gray-800 truncate">
              {row.titre}
            </span>
            <span className="text-xs text-gray-500 truncate">{row.code}</span>
          </div>
        </div>
      )
    },
    {
      key: 'cours-niveau',
      label: 'NIVEAU',
      className: 'min-w-[140px] hidden md:table-cell',
      render: (_, row) => (
        <InfoBadge 
          label={`${row.niveau?.nom || 'N/A'} - ${row.semestre?.code || 'S1'}`}
          variant="blue"
        />
      )
    },
    {
      key: 'cours-etudiants',
      label: 'ÉTUDIANTS',
      className: 'min-w-[100px] hidden sm:table-cell text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">{row.nb_etudiants || 0}</span>
        </div>
      )
    },
    {
      key: 'cours-heures',
      label: 'HEURES',
      className: 'min-w-[80px] hidden lg:table-cell text-center',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{row.nb_heures || 0}h</span>
        </div>
      )
    },
    {
      key: 'cours-evaluations',
      label: 'ÉVALUATIONS',
      className: 'min-w-[80px] hidden lg:table-cell text-center',
      render: (_, row) => (
        <span className="text-sm font-medium">{row.nb_evaluations || 0}</span>
      )
    },
    {
      key: 'cours-actions',
      label: 'ACTIONS',
      className: 'w-[100px]',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Link href={`/professeur/cours/${row.id}`}>
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
        title="Mes Cours" 
        description="Gérez vos cours et suivez vos étudiants"
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <ListPageLayout
          title="Mes Cours"
          description="Liste de vos cours assignés"
          actionButton={
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Nouveau Cours
            </Button>
          }
        >
          {/* Onglets */}
          <div className="mb-6">
            <TabNavigation
              tabs={[
                { id: 'all', label: 'Tous', count: mesCours.length },
                { 
                  id: 'actifs', 
                  label: 'Actifs', 
                  count: mesCours.filter(c => !c.is_archived).length 
                },
                { 
                  id: 'archives', 
                  label: 'Archivés', 
                  count: mesCours.filter(c => c.is_archived).length 
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
              placeholder="Rechercher par titre ou code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tableau des cours */}
          <DataTableSection
            columns={columns}
            data={filteredData}
            loading={loading}
            emptyMessage="Aucun cours trouvé"
          />
        </ListPageLayout>
      </main>
    </div>
  );
}
