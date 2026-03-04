import { supabase } from './supabase';
import {
    Experience,
    ExperienceInsert,
    ExperienceUpdate,
} from '../types/database';

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all experiences for the current user, ordered by start_date descending.
 */
export async function getExperiences(): Promise<Experience[]> {
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('start_date', { ascending: false, nullsFirst: false });

    if (error) throw new Error(error.message);
    return data as Experience[];
}

/**
 * Fetch a single experience by ID.
 */
export async function getExperienceById(id: string): Promise<Experience> {
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data as Experience;
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new experience for the currently logged-in user.
 * `user_id` is injected server-side via RLS; we still need to pass it
 * because the NOT NULL constraint requires it.
 */
export async function createExperience(
    payload: Omit<ExperienceInsert, 'user_id'>
): Promise<Experience> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Utente non autenticato');

    const { data, error } = await supabase
        .from('experiences')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Experience;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateExperience(
    id: string,
    payload: ExperienceUpdate
): Promise<Experience> {
    const { data, error } = await supabase
        .from('experiences')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Experience;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteExperience(id: string): Promise<void> {
    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}
