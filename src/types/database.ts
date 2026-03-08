export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// ─── Language entry (stored as JSONB array in profiles.languages) ─────────────

export interface LanguageEntry {
    name: string;
    /** e.g. "Madrelingua", "C1", "B2" */
    level: string;
    /** 0–100, used for progress bars in templates */
    proficiency: number;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ExperienceType =
    | 'work'
    | 'education'
    | 'project'
    | 'certification'
    | 'volunteer'
    | 'language_cert';

export type DocumentType = 'cv' | 'cover_letter';
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ─── Row types (what you get back from SELECT) ────────────────────────────────

export interface Profile {
    id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
    // v2 contact fields
    phone: string | null;
    city: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    native_language: string | null;
    /** Array of languages with level and proficiency, stored as JSONB */
    languages: LanguageEntry[] | null;
    created_at: string;
    updated_at: string;
}

export interface Experience {
    id: string;
    user_id: string;
    type: ExperienceType;
    title: string;
    organization: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    tags: string[];
    skills: string[];
    metadata: Json;
    embedding: number[] | null; // vector(1536)
    created_at: string;
    updated_at: string;
}

export interface GeneratedDocument {
    id: string;
    user_id: string;
    doc_type: DocumentType;
    jd_text: string;
    jd_snippet: string | null; // generated column
    webhook_request_id: string | null;
    pdf_url: string | null;
    status: DocumentStatus;
    error_message: string | null;
    title: string | null; // user assigned title
    template_id: string | null; // v2 — template selezionato
    /** JSON result from n8n — used by the app to render the PDF locally */
    generated_content: Json | null;
    created_at: string;
    updated_at: string;
}

// ─── Insert types (what you send on INSERT) ───────────────────────────────────

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;

export type ExperienceInsert = Omit<
    Experience,
    'id' | 'created_at' | 'updated_at' | 'embedding' | 'jd_snippet'
>;

export type GeneratedDocumentInsert = Omit<
    GeneratedDocument,
    'id' | 'created_at' | 'updated_at' | 'jd_snippet'
>;

// ─── Update types ─────────────────────────────────────────────────────────────

export type ProfileUpdate = Partial<
    Omit<Profile, 'id' | 'created_at' | 'updated_at'>
>;

export type ExperienceUpdate = Partial<
    Omit<Experience, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'embedding'>
>;

export type GeneratedDocumentUpdate = Partial<
    Omit<GeneratedDocument, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'jd_snippet'>
>;

// ─── Supabase Database definition (used by the client generic) ────────────────

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: ProfileInsert;
                Update: ProfileUpdate;
            };
            experiences: {
                Row: Experience;
                Insert: ExperienceInsert;
                Update: ExperienceUpdate;
            };
            generated_documents: {
                Row: GeneratedDocument;
                Insert: GeneratedDocumentInsert;
                Update: GeneratedDocumentUpdate;
            };
        };
        Enums: {
            experience_type: ExperienceType;
            document_type: DocumentType;
            document_status: DocumentStatus;
        };
    };
}
