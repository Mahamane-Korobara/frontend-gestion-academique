import { Send } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ListPageFilters from '@/components/partage/ListPageFilters';
import DataTableSection from '@/components/partage/DataTableSection';

export default function AnnoncesSection({ 
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard 
          title="Annonces envoyées" 
          value={stats.totalEnvoyees}
          icon={Send}
          color="bg-blue-50 text-blue-600"
        />
      </div>

      {/* Filtres */}
      <ListPageFilters 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher une annonce..."
        onReset={onReset}
      />

      {/* Tableau */}
      <DataTableSection
        title="Historique des annonces"
        columns={columns}
        data={filteredData}
        loading={loading}
      />
    </div>
  );
}