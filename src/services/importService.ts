import { supabase } from './supabase';
import { updateProfile } from './profileService';
import { ImportResult, ImportSummary } from '../types/import';
import { ProfileUpdate } from '../types/database';

const IMPORT_WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_IMPORT_WEBHOOK_URL;

const CEFR_PROFICIENCY: Record<string, number> = {
    Madrelingua: 100,
    C2: 95,
    C1: 80,
    B2: 65,
    B1: 50,
    A2: 30,
    A1: 15,
};

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Sends a PDF file to the n8n import webhook, receives structured AI data,
 * and saves everything to Supabase (profile fields + experiences + languages).
 *
 * Profile fields: filled only if currently null/empty (non-destructive).
 * Experiences:    inserted as new rows (user can remove duplicates manually).
 * Languages:      inserted as language_cert experience rows.
 */
export async function importCVFromPDF(
    fileUri: string,
    fileName: string,
    userId: string,
): Promise<ImportSummary> {
    if (!IMPORT_WEBHOOK_URL) {
        throw new Error(
            'EXPO_PUBLIC_N8N_IMPORT_WEBHOOK_URL non configurata. ' +
            'Aggiungila al tuo file .env prima di procedere.'
        );
    }

    // ── 1. Send PDF to n8n ────────────────────────────────────────────────────

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', {
        uri: fileUri,
        type: 'application/pdf',
        name: fileName || 'cv.pdf',
    } as any);

    const response = await fetch(IMPORT_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
            `Errore dal server (${response.status})` + (text ? ': ' + text.substring(0, 200) : '')
        );
    }

    const result: ImportResult = await response.json();

    // ── 2a. Update profile (only non-null fields from import) ─────────────────

    const profilePayload: ProfileUpdate = {};
    const p = result.profile;
    if (p.full_name)      profilePayload.full_name      = p.full_name;
    if (p.headline)       profilePayload.headline       = p.headline;
    if (p.phone)          profilePayload.phone          = p.phone;
    if (p.city)           profilePayload.city           = p.city;
    if (p.linkedin_url)   profilePayload.linkedin_url   = p.linkedin_url;
    if (p.portfolio_url)  profilePayload.portfolio_url  = p.portfolio_url;
    if (p.native_language) profilePayload.native_language = p.native_language;

    const profileUpdated = Object.keys(profilePayload).length > 0;
    if (profileUpdated) {
        await updateProfile(profilePayload);
    }

    // ── 2b. Insert experiences ────────────────────────────────────────────────

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utente non autenticato');

    const experienceRows = result.experiences.map((e) => ({
        user_id: user.id,
        type: e.type,
        title: e.title,
        organization: e.organization,
        location: e.location,
        start_date: e.start_date,
        end_date: e.end_date,
        is_current: e.is_current,
        description: e.description,
        tags: e.tags,
        skills: e.skills,
        metadata: {},
    }));

    // ── 2c. Languages → language_cert experience rows ─────────────────────────

    const languageRows = result.languages.map((l) => ({
        user_id: user.id,
        type: 'language_cert' as const,
        title: l.name,
        organization: null,
        location: null,
        start_date: null,
        end_date: null,
        is_current: true,
        description: null,
        tags: [l.level],
        skills: [],
        metadata: { proficiency: CEFR_PROFICIENCY[l.level] ?? l.proficiency ?? 50 },
    }));

    const allRows = [...experienceRows, ...languageRows];
    if (allRows.length > 0) {
        const { error } = await supabase.from('experiences').insert(allRows);
        if (error) throw new Error('Errore nel salvataggio esperienze: ' + error.message);
    }

    return {
        profileUpdated,
        experiencesImported: result.experiences.length,
        languagesImported: result.languages.length,
    };
}
