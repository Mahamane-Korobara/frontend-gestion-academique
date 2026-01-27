// src/lib/hooks/useApi.js
import { useState, useCallback, useRef } from 'react';

export default function useApi(apiFunc) { // <--- Bien vérifier le "default"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mémoriser la fonction pour éviter les changements à chaque rendu
    const apiFuncRef = useRef(apiFunc);

    const execute = useCallback(async (...params) => {
        try {
            setLoading(true);
            const result = await apiFuncRef.current(...params);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, execute };
}