'use client';

import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  Clock, 
  ClipboardList 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { label: 'Nouveau Utilisateur', icon: Plus, href: '/admin/utilisateurs?action=add' },
  { label: 'Générer Bulletins', icon: FileText, href: '/admin/bulletins' },
  { label: 'Emploi du Temps', icon: Clock, href: '/admin/emploi-du-temps' },
  { label: 'Gérer Annonces', icon: ClipboardList, href: '/admin/annonces' },
];

export default function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {QUICK_ACTIONS.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link key={idx} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto flex flex-col items-center justify-center gap-2 py-4"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm text-center">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
