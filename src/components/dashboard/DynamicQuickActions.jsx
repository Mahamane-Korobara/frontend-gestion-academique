'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, FileText, Clock, ClipboardList, 
  ClipboardCheck, MessageSquare, ShieldCheck, GraduationCap 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Centralisation des configurations par rôle
const ROLE_CONFIGS = {
  admin: {
    title: 'Actions Administratives',
    badge: 'ADMIN',
    actions: [
      { label: 'Nouvel Utilisateur', icon: Plus, href: '/admin/utilisateurs?action=add', color: 'bg-blue-50 text-blue-600 border-blue-100' },
      { label: 'Générer Bulletins', icon: FileText, href: '/admin/bulletins', color: 'bg-green-50 text-green-600 border-green-100' },
      { label: 'Emploi du Temps', icon: Clock, href: '/admin/emploi-du-temps', color: 'bg-purple-50 text-purple-600 border-purple-100' },
      { label: 'Gérer Annonces', icon: ClipboardList, href: '/admin/annonces', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    ]
  },
  professeur: {
    title: 'Actions Enseignant',
    badge: 'PROFS',
    actions: [
      { label: 'Nouvelle Annonce', icon: Plus, href: '/professeur/annonces/nouveau', color: 'bg-blue-50 text-blue-600 border-blue-100' },
      { label: 'Saisir des Notes', icon: ClipboardCheck, href: '/professeur/notes', color: 'bg-green-50 text-green-600 border-green-100' },
      { label: 'Envoyer Message', icon: MessageSquare, href: '/professeur/messages', color: 'bg-purple-50 text-purple-600 border-purple-100' },
      { label: 'Partager Document', icon: FileText, href: '/professeur/documents', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    ]
  }
};

export default function DynamicQuickActions({ role = 'admin' }) {
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.admin;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
          {config.title}
        </h3>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
          {config.badge}
        </span>
      </div>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {config.actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} href={action.href} className="group">
                <div className="h-full p-5 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:shadow-md active:scale-95">
                  <div className={`w-14 h-14 rounded-xl ${action.color} border flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {action.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}