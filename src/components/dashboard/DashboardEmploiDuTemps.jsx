import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import DashboardSection from './DashboardSection';

export default function DashboardEmploiDuTemps({ emploiDuTemps = {} }) {
  const seances = emploiDuTemps.prochaines_seances || [];

  if (!seances || seances.length === 0) {
    return (
      <DashboardSection title="Emploi du Temps">
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aucune séance prévue</p>
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Emploi du Temps - Prochaines Séances">
      <div className="space-y-3">
        {seances.slice(0, 5).map((seance, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                {seance.cours?.titre}
              </h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {seance.jour}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{seance.heure_debut} - {seance.heure_fin}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{seance.salle || 'Salle TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{seance.nb_etudiants || 0} étudiants</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  {seance.niveau?.nom}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
}
