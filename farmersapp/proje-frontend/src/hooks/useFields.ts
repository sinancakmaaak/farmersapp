import { useState, useEffect } from 'react';
import { Field } from '../types';
import { getAllFields } from '../services/fieldService';

export const useFields = () => {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const data = await getAllFields();
                setFields(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching fields:', err);
                setError('Tarlalar yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, []);

    return { fields, loading, error };
}; 