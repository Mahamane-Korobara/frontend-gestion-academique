'use client';

import React from 'react';
import { Users, Check, BarChart3 } from 'lucide-react';
import DataTableSection from '@/components/partage/DataTableSection';
import { formatNumber } from '@/lib/utils/format';

export default function DashboardStatsCours({ statsCours = [], loading = false }) {
  const columns = [
    {
      key: 'titre',
      label: 'Cours',
      cellClassName: 'font-medium text-gray-900',
    },
    {
      key: 'etudiants',
      label: 'Étudiants',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1.5 text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'notes_saisies',
      label: 'Notes Saisies',
      className: 'text-center',
      cellClassName: 'text-center',
      render: (value) => (
        <div className="flex items-center justify-center gap-1.5 text-gray-600">
          <Check className="w-4 h-4 text-green-500" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'moyenne',
      label: 'Moyenne',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (value) => (
        <span className="font-bold text-gray-900">
          {formatNumber(parseFloat(value), 2)}/20
        </span>
      ),
    },
  ];

  // Gestion de l'affichage si aucune donnée
  if (!loading && (!statsCours || statsCours.length === 0)) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="text-lg font-medium">Aucune statistique disponible</p>
        <p className="text-sm">Vous n'avez pas encore de cours ou de notes enregistrées.</p>
      </div>
    );
  }

  return (
    <DataTableSection
      title="Statistiques des Cours"
      columns={columns}
      data={statsCours}
      loading={loading}
      count={statsCours.length}
      itemsPerPage={5} // Idéal pour un dashboard (vue compacte)
    />
  );
}