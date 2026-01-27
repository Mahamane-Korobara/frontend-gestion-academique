'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardAcademique({ academique = {} }) {
  const data = [
    {
      label: 'Moyenne Générale',
      value: academique.moyenne_generale?.toFixed(2) || '0.00',
      subtitle: 'Sur 20',
    },
    {
      label: 'Taux de Réussite',
      value: `${academique.taux_reussite_global?.toFixed(1) || '0'}%`,
    },
    {
      label: 'Notes Saisies',
      value: academique.notes_saisies || '0',
    },
    {
      label: 'Bulletins Générés',
      value: academique.bulletins_genres || '0',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {data.map((item, idx) => (
        <Card key={idx}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            {item.subtitle && <p className="text-xs text-gray-500">{item.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
