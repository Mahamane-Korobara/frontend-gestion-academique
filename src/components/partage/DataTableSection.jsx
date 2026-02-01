/**
 * Composant réutilisable pour afficher une section avec tableau
 * Inclut l'en-tête, le titre, le compteur et le tableau
 */

import DataTable from './DataTable';

export default function DataTableSection({
  title,
  columns,
  data,
  loading,
  itemsPerPage = 10,
  count,
  rightAction = null,
}) {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">
            {title}
          </h3>
          {count !== undefined && (
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded border border-gray-100">
              {count}
            </span>
          )}
        </div>
        {rightAction && rightAction}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <DataTable 
          columns={columns}
          data={data}
          itemsPerPage={itemsPerPage}
          title={null}
          loading={loading}
        />
      </div>
    </div>
  );
}
