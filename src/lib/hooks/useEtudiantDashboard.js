'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { etudiantAPI } from '@/lib/api/endpoints';

export default function useEtudiantDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestRef = useRef(0);

  const fetchDashboard = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await etudiantAPI.getDashboard();
      if (requestId !== requestRef.current) return;
      setDashboard(response);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Erreur chargement dashboard étudiant:', err);
      setError(err);
      setDashboard(null);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
