import React from 'react';
import { ClipboardCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardSection from './DashboardSection';
import Link from 'next/link';

export default function DashboardNotesATraiter({ notes = {} }) {
  const evaluationsEnAttente = notes.en_attente || [];
  const totalNotes = notes.total || 0;
  const notesValidees = notes.validees || 0;

  return (
    <DashboardSection title="Gestion des Notes">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total de Notes</p>
              <p className="text-2xl font-bold text-blue-900">{totalNotes}</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Notes Validées</p>
              <p className="text-2xl font-bold text-green-900">{notesValidees}</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">En Attente</p>
              <p className="text-2xl font-bold text-red-900">{evaluationsEnAttente.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {evaluationsEnAttente.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Évaluations en Attente
            </h4>
            <div className="space-y-2">
              {evaluationsEnAttente.slice(0, 5).map((evaluation, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {evaluation.evaluation?.libelle}
                    </p>
                    <p className="text-xs text-gray-500">
                      {evaluation.cours?.titre} - {evaluation.nb_notes || 0} notes
                    </p>
                  </div>
                  <Link href="/professeur/notes">
                    <Button size="sm" variant="outline">
                      Corriger
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
      )}
    </DashboardSection>
  );
}
