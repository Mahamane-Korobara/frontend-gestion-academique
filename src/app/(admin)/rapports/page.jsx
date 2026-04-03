'use client';

import { useEffect, useMemo, useState } from 'react';
import { Database, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import ListPageLayout from '@/components/partage/ListPageLayout';
import FormSelect from '@/components/forms/FormMultiSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { anneesAcademiquesAPI, rapportsAdminAPI } from '@/lib/api/endpoints';

const INCLUDE_OPTIONS = [
    { key: 'users', label: 'Utilisateurs (admin, prof, étudiants)' },
    { key: 'etudiants', label: 'Étudiants' },
    { key: 'professeurs', label: 'Professeurs' },
    { key: 'filieres', label: 'Filières' },
    { key: 'niveaux', label: 'Niveaux' },
    { key: 'cours', label: 'Cours' },
    { key: 'affectations', label: 'Affectations prof ↔ cours' },
    { key: 'inscriptions', label: 'Inscriptions' },
    { key: 'evaluations', label: 'Évaluations' },
    { key: 'notes', label: 'Notes' },
    { key: 'types_evaluations', label: "Types d'evaluations" },
    { key: 'salles', label: 'Salles' },
    { key: 'emplois_du_temps', label: 'Emploi du temps' },
    { key: 'semestres', label: 'Semestres' },
    { key: 'annees_academiques', label: 'Années académiques' },
    { key: 'annonces', label: 'Annonces' },
    { key: 'messages', label: 'Messages' },
    { key: 'documents', label: 'Documents' },
    { key: 'notes_exports', label: 'Historique des exports de notes' },
];

const buildInitialInclude = () =>
    INCLUDE_OPTIONS.reduce((acc, item) => {
        acc[item.key] = true;
        return acc;
    }, {});

export default function AdminRapportsPage() {
    const [annees, setAnnees] = useState([]);
    const [selectedAnneeId, setSelectedAnneeId] = useState('');
    const [include, setInclude] = useState(buildInitialInclude);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchAnnees = async () => {
            try {
                const res = await anneesAcademiquesAPI.getAll();
                const data = res?.data || res || [];
                if (!isMounted) return;

                setAnnees(data);
                const active = data.find((a) => a.is_active);
                const fallback = data[0];
                setSelectedAnneeId(String(active?.id || fallback?.id || ''));
            } catch (err) {
                console.error(err);
                toast.error("Impossible de charger les années académiques.");
            }
        };

        fetchAnnees();
        return () => {
            isMounted = false;
        };
    }, []);

    const anneeOptions = useMemo(
        () =>
            (annees || []).map((annee) => ({
                value: String(annee.id),
                label: `${annee.annee}${annee.is_active ? ' (active)' : ''}`,
            })),
        [annees]
    );

    const selectedAnnee = useMemo(
        () => annees.find((a) => String(a.id) === String(selectedAnneeId)),
        [annees, selectedAnneeId]
    );

    const handleToggleInclude = (key, checked) => {
        setInclude((prev) => ({ ...prev, [key]: checked }));
    };

    const handleSelectAll = (checked) => {
        setInclude(INCLUDE_OPTIONS.reduce((acc, item) => {
            acc[item.key] = checked;
            return acc;
        }, {}));
    };

    const handleExport = async (format) => {
        if (!selectedAnneeId) {
            toast.error("Sélectionnez une année académique.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                annee_academique_id: Number(selectedAnneeId),
                format,
                include,
            };

            const blob = await rapportsAdminAPI.exportData(payload);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const safeAnnee = selectedAnnee?.annee?.replace(/\s+/g, '_') || 'annee';
            a.href = url;
            a.download = format === 'sql'
                ? `rapports_${safeAnnee}.sql`
                : `rapports_${safeAnnee}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Export téléchargé avec succès');
        } catch (err) {
            toast.error(err?.message || "Erreur lors de l'export");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ListPageLayout
            title="Rapports"
            description="Exporter les données de gestion pour une année académique."
        >
            <Card>
                <CardHeader className="pb-0">
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-gray-500" />
                        Export des données
                    </CardTitle>
                    <CardDescription>
                        Toutes les données administratives (sans mot de passe) peuvent être exportées en Excel (ZIP)
                        ou en SQL pour l&apos;année choisie. Les tables techniques (jobs, cache, sessions, migrations)
                        ne sont pas incluses dans l&apos;export Excel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">Année académique</p>
                            <FormSelect
                                id="annee_academique_id"
                                value={selectedAnneeId || ''}
                                onValueChange={(value) => setSelectedAnneeId(value)}
                                options={anneeOptions}
                                placeholder="Sélectionner une année"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="text-sm text-gray-600">
                                <p className="font-semibold text-gray-800">Sécurité</p>
                                <p>Les mots de passe ne sont jamais inclus.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => handleExport('excel')}
                                disabled={loading || !selectedAnneeId}
                                className="h-9"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                                Export Excel (ZIP)
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport('sql')}
                                disabled={loading || !selectedAnneeId}
                                className="h-9"
                            >
                                <Download className="w-4 h-4 mr-1.5" />
                                Export SQL
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Données à inclure</p>
                                <p className="text-xs text-gray-500">Tu peux décocher les éléments inutiles.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={Object.values(include).every(Boolean)}
                                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                                    aria-label="Tout sélectionner"
                                />
                                <span className="text-xs text-gray-600">Tout sélectionner</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {INCLUDE_OPTIONS.map((option) => (
                                <label
                                    key={option.key}
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                                >
                                    <Checkbox
                                        checked={include[option.key]}
                                        onCheckedChange={(checked) => handleToggleInclude(option.key, checked === true)}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ListPageLayout>
    );
}
