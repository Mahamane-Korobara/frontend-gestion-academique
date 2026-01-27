// src/components/dashboard/RecentActivity.jsx
'use client';

import { useState, useMemo } from 'react';
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from '@/components/partage/Pagination';

const ITEMS_PER_PAGE = 5;

export default function RecentActivity({ activities = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const data = activities;

  // Pagination
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 si les données changent
  useMemo(() => {
    setCurrentPage(1);
  }, [data]);

  const ActivityItem = ({ item }) => (
    <div className="flex gap-3 py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      {/* Icône */}
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
        {item.action === 'add' ? (
          <Plus className="w-4 h-4 text-blue-600" />
        ) : item.action === 'check' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : item.action === 'login' ? (
          <CheckCircle className="w-4 h-4 text-purple-600" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">
              {item.description}
            </p>
            {item.user_name && (
              <p className="text-xs text-gray-600 truncate">{item.user_name}</p>
            )}
            {item.user_role && (
              <p className="text-xs text-gray-500 truncate">{item.user_role}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {item.created_at}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Activités Récentes</CardTitle>
        <CardDescription>Historique des actions administratives</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {/* Liste des activités */}
        <div className="space-y-0">
          {paginatedData.length > 0 ? (
            paginatedData.map((activity) => (
              <ActivityItem key={activity.id} item={activity} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune activité récente
            </div>
          )}
        </div>

        {/* Pagination */}
        {data.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={data.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}