import React from 'react';
import { Calendar, Clock, BookMarked } from 'lucide-react';
import DashboardSection from './DashboardSection';

export default function DashboardProchainsCours({ prochainsCours = [] }) {
  if (!prochainsCours || prochainsCours.length === 0) {
    return (
      <DashboardSection title="Prochains Cours">
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucun cours prévu</p>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Prochains Cours">
      <div className="space-y-3">
        {prochainsCours.map((cours, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-blue-600" />
                {cours.cours}
              </h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {cours.niveau}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{cours.jour}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{cours.heure}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
