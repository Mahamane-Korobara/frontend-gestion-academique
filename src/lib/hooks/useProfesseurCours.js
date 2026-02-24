'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { professeurCoursService } from '@/lib/services/professeurCours.service';

function normalizeCoursResponse(response) {
    if (Array.isArray(response)) {
        return { cours: response, total: response.length };
    }

    if (Array.isArray(response?.cours)) {
        return {
            cours: response.cours,
            total: Number.isFinite(response.total) ? response.total : response.cours.length,
        };
    }

    if (Array.isArray(response?.data)) {
        return {
            cours: response.data,
            total: response?.meta?.total ?? response.data.length,
        };
    }

    return { cours: [], total: 0 };
}

export default function useProfesseurCours() {
    const [cours, setCours] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);
    const initialFetchDone = useRef(false);

    const fetchCours = useCallback(async (shouldResetInitialFlag = false) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const response = await professeurCoursService.getMesCours();

            if (!abortControllerRef.current.signal.aborted) {
                const normalized = normalizeCoursResponse(response);
                setCours(normalized.cours);
                setTotal(normalized.total);

                if (shouldResetInitialFlag) {
                    initialFetchDone.current = true;
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err);
                setCours([]);
                setTotal(0);
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current) {
            fetchCours(true);
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchCours]);

    return {
        cours,
        total,
        loading,
        error,
        refetch: fetchCours,
    };
}
