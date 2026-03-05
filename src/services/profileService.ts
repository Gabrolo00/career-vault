import { supabase } from './supabase';
import { Profile, ProfileUpdate } from '../types/database';

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utente non autenticato');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        // Row non esiste ancora (race con trigger) → null
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
    }
    return data as Profile;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProfile(payload: ProfileUpdate): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utente non autenticato');

    const { data, error } = await (supabase
        .from('profiles') as any)
        .update(payload)
        .eq('id', user.id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Profile;
}

// ─── Avatar upload ─────────────────────────────────────────────────────────────

/**
 * Carica (o sostituisce) l'avatar nel bucket Supabase Storage "avatars" e
 * aggiorna il campo `avatar_url` del profilo.
 *
 * @param localUri  URI locale (es. da expo-image-picker)
 * @param mimeType  MIME type dell'immagine (es. 'image/jpeg')
 * @returns         URL pubblico dell'avatar caricato
 */
export async function uploadAvatar(localUri: string, mimeType = 'image/jpeg'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utente non autenticato');

    // Fetch del file locale → blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    const ext = mimeType.split('/')[1] ?? 'jpg';
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
            contentType: mimeType,
            upsert: true,       // sovrascrive se esiste già
        });

    if (uploadError) throw new Error(uploadError.message);

    // URL pubblico (il bucket è pubblico)
    const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    const avatarUrl = publicData.publicUrl;

    // Aggiorna il profilo con il nuovo URL
    await updateProfile({ avatar_url: avatarUrl });

    return avatarUrl;
}
