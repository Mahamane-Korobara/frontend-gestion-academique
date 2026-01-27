'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardAlerts({ alerts = [] }) {
  const router = useRouter();

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, idx) => (
        <Alert key={idx} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <div className="flex items-start justify-between gap-4 flex-1">
            <div>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </div>
            {alert.action && (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => router.push(alert.action)}
              >
                Voir
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
}
