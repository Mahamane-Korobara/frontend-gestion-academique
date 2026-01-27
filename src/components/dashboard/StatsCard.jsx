'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// On renomme "icon" en "Icon" (avec une Majuscule) pour pouvoir l'utiliser comme une balise
export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'bg-blue-50 text-blue-600',
}) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className={`p-2 rounded-lg ${color}`}>
          {/* On appelle l'icône comme un composant <Icon /> */}
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}