'use client';

import React from 'react';
import { BookMarked, Users, AlertCircle } from 'lucide-react';
import StatsCard from './StatsCard';

export default function DashboardProfesseurStats({ resume = {} }) {
  const stats = [
    {
      title: 'Cours Enseignés',
      value: resume.cours_enseignes?.toLocaleString() || '0',
      subtitle: 'Cours assignés',
      icon: BookMarked,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Étudiants Suivis',
      value: resume.etudiants_suivis?.toLocaleString() || '0',
      subtitle: 'Inscrits à mes cours',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Notes en Attente',
      value: resume.notes_en_attente?.toLocaleString() || '0',
      subtitle: 'À corriger',
      icon: AlertCircle,
      // Logique de couleur dynamique conservée mais adaptée au format Admin
      color: resume.notes_en_attente > 0 
        ? 'bg-orange-50 text-orange-600' 
        : 'bg-green-50 text-green-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, idx) => (
        <StatsCard key={idx} {...stat} />
      ))}
    </div>
  );
}