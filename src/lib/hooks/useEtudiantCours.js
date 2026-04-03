'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { etudiantAPI } from '@/lib/api/endpoints';

export default function useEtudiantCours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  });

  const requestRef = useRef(0);

  const fetchCours = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await etudiantAPI.getCours({
        page: pagination.currentPage,
        per_page: pagination.perPage,
      });

      if (requestId !== requestRef.current) return;

      const data = response?.data || response || [];
      setCours(Array.isArray(data) ? data : []);

      if (response?.meta) {
        setPagination((prev) => ({
          ...prev,
          total: response.meta.total || 0,
          lastPage: Math.ceil((response.meta.total || 0) / (response.meta.per_page || 1)) || 1,
        }));
      }
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Erreur chargement cours étudiant:', err);
      setError(err);
      setCours([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchCours();
  }, [fetchCours]);

  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  return {
    cours,
    loading,
    error,
    pagination,
    goToPage,
    refetch: fetchCours,
  };
}
