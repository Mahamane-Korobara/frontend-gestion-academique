'use client';

import { useState, useMemo } from 'react';
import { Plus, CheckCircle, AlertTriangle, LogIn, Activity } from 'lucide-react';
import Pagination from '@/components/partage/Pagination';

const ITEMS_PER_PAGE = 5;

export default function RecentActivity({ activities = [] }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page logic
  useMemo(() => {
    setCurrentPage(1);
  }, [activities.length]);

  const ActivityItem = ({ item, index }) => (
    <div className="flex gap-4 py-4 px-6 border-b last:border-b-0 hover:bg-gray-50/50 transition-colors items-center">
      {/* Icône avec fond coloré selon l'action */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        item.action === 'add' ? 'bg-blue-50 text-blue-600' :
        item.action === 'check' ? 'bg-green-50 text-green-600' :
        item.action === 'login' ? 'bg-purple-50 text-purple-600' :
        'bg-yellow-50 text-yellow-600'
      }`}>
        {item.action === 'add' ? <Plus className="w-5 h-5" /> :
         item.action === 'check' ? <CheckCircle className="w-5 h-5" /> :
         item.action === 'login' ? <LogIn className="w-5 h-5" /> :
         <AlertTriangle className="w-5 h-5" />}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {item.user_name && (
                <span className="text-xs font-medium text-gray-600">{item.user_name}</span>
              )}
              {item.user_role && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">
                  {item.user_role}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {item.created_at}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* En-tête style "Admin" */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
            Activités Récentes
          </h3>
          {activities.length > 0 && (
            <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
              {activities.length}
            </span>
          )}
        </div>
        <Activity className="w-4 h-4 text-gray-400" />
      </div>

      {/* Corps de la liste */}
      <div className="flex-1">
        {paginatedData.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {paginatedData.map((activity, idx) => (
              <ActivityItem 
                key={activity.id || `activity-${idx}`} 
                item={activity} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mb-3 opacity-10" />
            <p className="text-sm">Aucune activité récente</p>
          </div>
        )}
      </div>

      {/* Pagination style "Admin" */}
      {activities.length > ITEMS_PER_PAGE && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={activities.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
}