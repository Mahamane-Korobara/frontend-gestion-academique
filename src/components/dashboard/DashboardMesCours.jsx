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
