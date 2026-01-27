'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DashboardLoadingState({ isLoading, isError }) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Titre skeleton */}
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
        
        {/* Stats cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-gray-100" />
              <CardContent className="h-24 bg-gray-50" />
            </Card>
          ))}
        </div>

        {/* Academic data skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-gray-100" />
              <CardContent className="h-20 bg-gray-50" />
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100" />
              <CardContent className="h-64 bg-gray-50" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de charger le tableau de bord</AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
