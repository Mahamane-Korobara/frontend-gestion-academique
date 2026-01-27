'use client';

import { GraduationCap, Users, BookOpen, Network, ListChecks } from 'lucide-react';
import StatsCard from './StatsCard';

export default function DashboardStats({ resume = {} }) {
  const stats = [
    {
      title: 'Total Étudiants',
      value: resume.total_etudiants?.toLocaleString() || '0',
      subtitle: `${resume.etudiants_actifs || 0} actifs`,
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Professeurs',
      value: resume.total_professeurs?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Cours Actifs',
      value: resume.total_cours?.toLocaleString() || '0',
      icon: BookOpen,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Filières',
      value: resume.total_filieres?.toLocaleString() || '0',
      icon: Network,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Niveaux',
      value: resume.total_niveaux?.toLocaleString() || '0',
      icon: ListChecks,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, idx) => (
        <StatsCard key={idx} {...stat} />
      ))}
    </div>
  );
}
