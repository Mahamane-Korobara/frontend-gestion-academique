// src/lib/hooks/useApi.js
import { useState, useCallback } from 'react';

export default function useApi(apiFunc) { // <--- Bien vérifier le "default"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...params) => {
        try {
            setLoading(true);
            const result = await apiFunc(...params);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunc]);

    return { data, loading, error, execute };
}