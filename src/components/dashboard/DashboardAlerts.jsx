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

    const normalizeAlertPath = (path) => {
        if (typeof path !== 'string' || !path.trim()) return null;
        const rawPath = path.trim();

        const routeAliases = {
            '/admin/emploi-du-temps': '/emploi-du-temps',
            '/admin/emplois-du-temps': '/emploi-du-temps',
            '/admin/matieres-cours': '/matieres-cours',
            '/admin/annees-academiques': '/annees-academiques',
            '/admin/filieres-niveaux': '/filieres-niveaux',
            '/admin/evaluations': '/evaluations',
        };

        if (/^\/admin\/evaluations(\/.*)?$/.test(rawPath)) return '/evaluations';
        if (/^\/evaluations\/.+$/.test(rawPath)) return '/evaluations';
        if (routeAliases[rawPath]) return routeAliases[rawPath];
        if (rawPath.startsWith('/admin/')) return rawPath.replace('/admin', '');
        return rawPath;
    };

    const handleNavigate = (path) => {
        const nextPath = normalizeAlertPath(path);
        if (!nextPath) return;
        router.push(nextPath);
    };

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
