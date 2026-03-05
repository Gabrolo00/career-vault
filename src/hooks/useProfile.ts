import { useState, useEffect, useCallback } from 'react';
import { Profile, ProfileUpdate } from '../types/database';
import { getProfile, updateProfile, uploadAvatar } from '../services/profileService';

interface UseProfileReturn {
    profile: Profile | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    save: (payload: ProfileUpdate) => Promise<void>;
    changeAvatar: (localUri: string, mimeType?: string) => Promise<void>;
}

export function useProfile(): UseProfileReturn {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProfile();
            setProfile(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const save = useCallback(async (payload: ProfileUpdate) => {
        try {
            setSaving(true);
            setError(null);
            const updated = await updateProfile(payload);
            setProfile(updated);
        } catch (e) {
            setError((e as Error).message);
            throw e;
        } finally {
            setSaving(false);
        }
    }, []);

    const changeAvatar = useCallback(async (localUri: string, mimeType?: string) => {
        try {
            setSaving(true);
            setError(null);
            const url = await uploadAvatar(localUri, mimeType);
            setProfile((prev) => prev ? { ...prev, avatar_url: url } : prev);
        } catch (e) {
            setError((e as Error).message);
            throw e;
        } finally {
            setSaving(false);
        }
    }, []);

    return { profile, loading, saving, error, refresh, save, changeAvatar };
}
