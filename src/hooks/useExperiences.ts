import { useState, useEffect, useCallback } from 'react';
import { Experience, ExperienceInsert, ExperienceUpdate } from '../types/database';
import {
    getExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
} from '../services/experienceService';

interface UseExperiencesReturn {
    experiences: Experience[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    add: (payload: Omit<ExperienceInsert, 'user_id'>) => Promise<Experience>;
    update: (id: string, payload: ExperienceUpdate) => Promise<Experience>;
    remove: (id: string) => Promise<void>;
}

export function useExperiences(): UseExperiencesReturn {
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getExperiences();
            setExperiences(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const add = useCallback(
        async (payload: Omit<ExperienceInsert, 'user_id'>) => {
            const newExp = await createExperience(payload);
            setExperiences((prev) => [newExp, ...prev]);
            return newExp;
        },
        []
    );

    const update = useCallback(async (id: string, payload: ExperienceUpdate) => {
        const updated = await updateExperience(id, payload);
        setExperiences((prev) =>
            prev.map((e) => (e.id === id ? updated : e))
        );
        return updated;
    }, []);

    const remove = useCallback(async (id: string) => {
        await deleteExperience(id);
        setExperiences((prev) => prev.filter((e) => e.id !== id));
    }, []);

    return { experiences, loading, error, refresh, add, update, remove };
}
