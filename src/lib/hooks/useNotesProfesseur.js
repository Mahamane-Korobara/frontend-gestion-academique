'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import notesProfesseurService from '@/lib/services/notesProfesseur.service';
import useEvaluationsProfesseur from '@/lib/hooks/useEvaluationsProfesseur';
import { TYPES_EVALUATIONS } from '@/lib/utils/constants';

const EXAM_TYPE_ID = TYPES_EVALUATIONS[0]?.value;

function normalizeEvaluations(evaluations = []) {
    const filtered = EXAM_TYPE_ID
        ? (evaluations || []).filter(
            (ev) => String(ev?.type_evaluation?.id) === String(EXAM_TYPE_ID)
        )
        : (evaluations || []);

    const chooseBest = (current, candidate) => {
        if (!current) return candidate;

        const currSoumises = Number(
            current?.nb_notes_soumises ?? current?.nb_notes_validees ?? 0
        );
        const candSoumises = Number(
            candidate?.nb_notes_soumises ?? candidate?.nb_notes_validees ?? 0
        );

        if (candSoumises !== currSoumises) {
            return candSoumises > currSoumises ? candidate : current;
        }

        const currSaisies = Number(current?.nb_notes_saisies ?? 0);
        const candSaisies = Number(candidate?.nb_notes_saisies ?? 0);
        if (candSaisies !== currSaisies) {
            return candSaisies > currSaisies ? candidate : current;
        }

        const currDate = current?.date_evaluation
            ? new Date(current.date_evaluation).getTime()
            : 0;
        const candDate = candidate?.date_evaluation
            ? new Date(candidate.date_evaluation).getTime()
            : 0;
        if (candDate !== currDate) {
            return candDate > currDate ? candidate : current;
        }

        const currId = Number(current?.id ?? 0);
        const candId = Number(candidate?.id ?? 0);
        return candId > currId ? candidate : current;
    };

    const dedupedMap = new Map();
    filtered.forEach((ev) => {
        const coursId = ev?.cours?.id ?? ev?.cours_id ?? 'na';
        const semestreId = ev?.semestre?.id ?? ev?.semestre_id ?? 'na';
        const typeId = ev?.type_evaluation?.id ?? ev?.type_evaluation_id ?? 'na';
        const key = `${coursId}|${semestreId}|${typeId}`;

        const current = dedupedMap.get(key);
        dedupedMap.set(key, chooseBest(current, ev));
    });

    return Array.from(dedupedMap.values()).map((ev) => {
        const nbNotesTotales = Number(ev?.nb_notes_totales ?? 0);
        const nbNotesSaisies = Number(ev?.nb_notes_saisies ?? 0);
        const nbNotesSoumises = Number(
            ev?.nb_notes_soumises ?? ev?.nb_notes_validees ?? 0
        );
        const typeLabel = TYPES_EVALUATIONS[0]?.label ?? ev?.type_evaluation?.nom ?? 'N/A';

        let etatNotes = ev?.etat_notes || 'en_cours';
        if (nbNotesTotales > 0 && nbNotesSoumises >= nbNotesTotales) {
            etatNotes = 'soumise';
        } else if (nbNotesSoumises > 0) {
            etatNotes = 'partielle';
        } else {
            etatNotes = 'en_cours';
        }

        return {
            id: ev?.id,
            libelle: typeLabel,
            type: typeLabel,
            cours: ev?.cours || null,
            semestre: ev?.semestre || null,
            date_evaluation: ev?.date_evaluation || null,
            nb_notes_saisies: nbNotesSaisies,
            nb_notes_totales: nbNotesTotales,
            nb_notes_soumises: nbNotesSoumises,
            etat_notes: etatNotes,
        };
    });
}

export default function useNotesProfesseur() {
    const {
        evaluations: rawEvaluations,
        loading: evaluationsLoading,
        error: evaluationsError,
        refetch: refetchEvaluations,
    } = useEvaluationsProfesseur();

    const evaluations = useMemo(
        () => normalizeEvaluations(rawEvaluations),
        [rawEvaluations]
    );

    const [selectedEvaluationId, setSelectedEvaluationId] = useState(null);
    const [selectedEvaluationDetails, setSelectedEvaluationDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rowErrors, setRowErrors] = useState({});

    const requestIdRef = useRef(0);

    const loadEvaluationDetails = useCallback(async (evaluationId) => {
        if (!evaluationId) return null;

        const requestId = ++requestIdRef.current;
        setSelectedEvaluationId(evaluationId);
        setDetailsLoading(true);
        setRowErrors({});

        try {
            const data = await notesProfesseurService.getEvaluationNotes(evaluationId);
            if (requestId !== requestIdRef.current) return null;

            setSelectedEvaluationDetails(data);
            return data;
        } catch (error) {
            if (requestId === requestIdRef.current) {
                setSelectedEvaluationDetails(null);
            }
            throw error;
        } finally {
            if (requestId === requestIdRef.current) {
                setDetailsLoading(false);
            }
        }
    }, []);

    const resetSelection = useCallback(() => {
        setSelectedEvaluationId(null);
        setSelectedEvaluationDetails(null);
        setRowErrors({});
    }, []);

    const saveNotes = useCallback(async ({ rows = [], soumettre = false }) => {
        if (!selectedEvaluationId) return null;

        setSaving(true);
        setRowErrors({});

        const payload = {
            soumettre,
            notes: (rows || []).map((row) => {
                const noteValue =
                    row?.note === '' || row?.note === null || row?.note === undefined
                        ? null
                        : Number(row.note);

                return {
                    etudiant_id: row.etudiant_id,
                    note: noteValue,
                    is_absent: Boolean(row.is_absent),
                    commentaire: row.commentaire || null,
                };
            }),
        };

        try {
            const res = await notesProfesseurService.saveNotes(selectedEvaluationId, payload);

            toast.success(
                soumettre
                    ? 'Notes soumises avec succès'
                    : 'Notes enregistrées en brouillon'
            );

            await refetchEvaluations();
            const updatedDetails = await loadEvaluationDetails(selectedEvaluationId);

            return {
                response: res,
                details: updatedDetails,
            };
        } catch (error) {
            if (error?.status === 422 && error?.errors) {
                setRowErrors(error.errors);
            } else {
                toast.error(error?.message || 'Erreur lors de la sauvegarde des notes');
            }
            throw error;
        } finally {
            setSaving(false);
        }
    }, [selectedEvaluationId, refetchEvaluations, loadEvaluationDetails]);

    return {
        evaluations,
        evaluationsLoading,
        evaluationsError,
        refetchEvaluations,
        selectedEvaluationId,
        selectedEvaluationDetails,
        detailsLoading,
        saving,
        rowErrors,
        loadEvaluationDetails,
        saveNotes,
        resetSelection,
    };
}
