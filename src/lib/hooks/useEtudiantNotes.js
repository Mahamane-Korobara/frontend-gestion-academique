'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { etudiantAPI } from '@/lib/api/endpoints';

export default function useEtudiantNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
  });

  const requestRef = useRef(0);

  const fetchNotes = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await etudiantAPI.getNotes({
        page: pagination.currentPage,
        per_page: pagination.perPage,
      });

      if (requestId !== requestRef.current) return;

      const data = response?.data || response || [];
      setNotes(Array.isArray(data) ? data : []);

      if (response?.meta) {
        setPagination((prev) => ({
          ...prev,
          total: response.meta.total || 0,
          lastPage: response.meta.last_page || 1,
        }));
      }
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Erreur chargement notes étudiant:', err);
      setError(err);
      setNotes([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  return {
    notes,
    loading,
    error,
    pagination,
    goToPage,
    refetch: fetchNotes,
  };
}
