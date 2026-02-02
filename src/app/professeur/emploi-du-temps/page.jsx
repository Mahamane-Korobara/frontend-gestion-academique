'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

// UI & Layout
import ListPageLayout from '@/components/partage/ListPageLayout';
import Header from '@/components/layout/Header';
import EmploiDuTemps from '@/components/calendrier/EmploiDuTemps';

// Hooks
import useApi from '@/lib/hooks/useApi';
import { emploiDuTempsProfesseurAPI } from '@/lib/api/endpoints';

export default function EmploiDuTempsPage() {
  const [viewMode, setViewMode] = useState('semaine'); // semaine, jour, resume
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Récupérer l'emploi du temps
  const { data: emploiDuTemps = {}, loading } = useApi(
    () => emploiDuTempsProfesseurAPI.getAll()
  );

  const seances = emploiDuTemps.seances || [];

  return (
    <div>
      <Header 
        title="Emploi du Temps" 
        description="Consultez votre calendrier et vos horaires de cours"
      />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <ListPageLayout
          title="Emploi du Temps"
          description="Gérez votre calendrier académique"
        >
          {/* Options de vue */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setViewMode('semaine')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'semaine'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('jour')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'jour'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('resume')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'resume'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Résumé
            </button>
          </div>

          {/* Composant Emploi du Temps */}
          <div className="bg-white rounded-lg border">
            <EmploiDuTemps 
              seances={seances}
              loading={loading}
              viewMode={viewMode}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {/* Liste des prochaines séances */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prochaines Séances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seances.slice(0, 6).map((seance, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {seance.cours?.titre}
                  </h4>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{seance.jour}</span>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ListPageLayout>
      </main>
    </div>
  );
}
