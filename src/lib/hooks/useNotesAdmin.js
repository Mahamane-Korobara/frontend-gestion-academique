'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import notesAdminService from '@/lib/services/notesAdmin.service';

export default function useNotesAdmin(initialFilters = {}) {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({});

    const abortRef = useRef(null);
    const initialFetchDone = useRef(false);
    const [filters, setFilters] = useState({
        cours_id: null,
        etudiant_id: null,
        semestre_id: null,
        filiere_id: null,
        niveau_id: null,
        per_page: 500,
        ...initialFilters,
    });

    const fetchNotes = useCallback(async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const response = await notesAdminService.getSoumises(filters);
            if (!abortRef.current?.signal.aborted) {
                setNotes(response?.data || []);
                setMeta(response?.meta || {});
                initialFetchDone.current = true;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
            }
        } finally {
            if (!abortRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, [filters]);

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchNotes();
        }

        return () => abortRef.current?.abort();
    }, [fetchNotes]);

    useEffect(() => {
        if (initialFetchDone.current) {
            fetchNotes();
        }
    }, [fetchNotes, filters]);

    const refetch = useCallback(() => fetchNotes(), [fetchNotes]);

    const updateFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value || null }));
    }, []);

    const resetServerFilters = useCallback(() => {
        setFilters((prev) => ({
            ...prev,
            cours_id: null,
            etudiant_id: null,
            semestre_id: null,
            filiere_id: null,
            niveau_id: null,
        }));
    }, []);

    const reouvrirMasse = useCallback(
        async (noteIds) => {
            const response = await notesAdminService.reouvrirMasse(noteIds);
            await refetch();
            return response;
        },
        [refetch]
    );

    const exportStatus = useCallback(async (params) => {
        return notesAdminService.exportStatus(params);
    }, []);

    const exportExcel = useCallback(async (payload) => {
        return notesAdminService.exportExcel(payload);
    }, []);

    return {
        notes,
        loading,
        error,
        meta,
        filters,
        refetch,
        updateFilter,
        resetServerFilters,
        reouvrirMasse,
        exportStatus,
        exportExcel,
    };
}
