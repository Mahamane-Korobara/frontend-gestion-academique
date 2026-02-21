'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogOverlay, DialogContent,
    DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import AlertModalContent from '@/components/ui/AlertModalContent';
import { useRouter } from 'next/navigation';


export default function DashboardAlerts({ alerts = [] }) {
    const router = useRouter();
    const [activeAlert, setActiveAlert] = useState(null);

    if (!alerts || alerts.length === 0) return null;

    const handleNavigate = (path) => router.push(path);

    return (
        <>
            <div className="space-y-3">
                {alerts.map((alert, idx) => (
                    <Alert key={idx} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
                        <AlertCircle className="h-4 w-4" />
                        <div className="flex items-start justify-between gap-4 flex-1">
                            <div>
                                <AlertTitle>{alert.title}</AlertTitle>
                                <AlertDescription>{alert.message}</AlertDescription>
                            </div>
                            {/* "Voir" → ouvre le modal contextuel */}
                            {(alert.action || alert.items) && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0"
                                    onClick={() => setActiveAlert(alert)}
                                >
                                    Voir
                                </Button>
                            )}
                        </div>
                    </Alert>
                ))}
            </div>

            {/* Modal contextuel */}
            <Dialog open={!!activeAlert} onOpenChange={() => setActiveAlert(null)}>
                <DialogOverlay className="backdrop-blur-sm" />
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{activeAlert?.title}</DialogTitle>
                        <DialogDescription>{activeAlert?.message}</DialogDescription>
                    </DialogHeader>
                    {activeAlert && (
                        <AlertModalContent
                            alert={activeAlert}
                            onClose={() => setActiveAlert(null)}
                            onNavigate={handleNavigate}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}