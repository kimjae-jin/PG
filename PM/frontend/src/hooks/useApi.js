import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const useApi = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(endpoint);
            setData(response.data.data || []);
            setError(null);
        } catch (err) {
            setError(err);
            console.error(`Failed to fetch from ${endpoint}`, err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refreshData: fetchData, setData };
};

export default useApi;
