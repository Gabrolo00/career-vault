import { ExperienceType } from './database';

// ─── What n8n returns ─────────────────────────────────────────────────────────

export interface ImportedProfile {
    full_name: string | null;
    headline: string | null;
    phone: string | null;
    city: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    native_language: string | null;
}

export interface ImportedExperience {
    type: ExperienceType;
    title: string;
    organization: string | null;
    location: string | null;
    /** ISO date "YYYY-MM-DD" or null */
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    tags: string[];
    skills: string[];
}

export interface ImportedLanguage {
    name: string;
    /** CEFR level or "Madrelingua" */
    level: string;
    /** 0–100 */
    proficiency: number;
}

export interface ImportResult {
    profile: ImportedProfile;
    experiences: ImportedExperience[];
    languages: ImportedLanguage[];
}

// ─── What the app reports back to the UI ──────────────────────────────────────

export interface ImportSummary {
    profileUpdated: boolean;
    experiencesImported: number;
    languagesImported: number;
}
