import { useState, useEffect } from 'react';
import { Greenhouse } from '../types';
import { getAllGreenhouses } from '../services/greenhouseService';

export const useGreenhouses = () => {
    const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGreenhouses = async () => {
            try {
                const data = await getAllGreenhouses();
                setGreenhouses(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching greenhouses:', err);
                setError('Seralar yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchGreenhouses();
    }, []);

    return { greenhouses, loading, error };
}; 