import { File, FolderOpen } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';

export default function DocumentsSection({ 
  stats, 
  tabs, 
  activeTab, 
  onTabChange, 
  searchQuery, 
  setSearchQuery, 
  onReset, 
  columns, 
  filteredData, 
  loading 
}) {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Documents" 
          value={stats.totalDocuments}
          icon={File}
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard 
          title="Espace Utilisé" 
          value={stats.espaceUtilise}
          icon={FolderOpen}
          color="bg-green-50 text-green-600"
        />
        <StatsCard 
          title="Ce Mois" 
          value={stats.documentsCeMois}
          icon={File}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Filtres */}
      <ListPageFilters 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par titre, description..."
        onReset={onReset}
      />

      {/* Tableau */}
      <DataTableSection
        title="Liste des documents"
        columns={columns}
        data={filteredData}
        loading={loading}
        emptyMessage="Aucun document trouvé"
      />
    </div>
  );
}