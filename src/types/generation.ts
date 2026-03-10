/**
 * generation.ts
 *
 * Defines the JSON contract between n8n (the "Copywriter") and the app (the "Designer").
 *
 * n8n receives: { userId, documentId, docType, jobDescription, templateId }
 * n8n returns:  N8nGenerationResult — pure text/data, NO HTML, NO PDF.
 *
 * The app takes this JSON, injects it into the local HTML template, and generates
 * the PDF entirely on-device via expo-print.
 */

// ─── Contact block (static data from user profile) ────────────────────────────

export interface N8nContactData {
    full_name: string;
    first_name: string;
    last_name: string;
    /** e.g. "MR" */
    initials: string;
    headline: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    avatar_url: string | null;
}

// ─── Experience / Education / Certification entry ─────────────────────────────

export interface N8nExperienceItem {
    title: string;
    organization: string;
    /** Human-readable period, e.g. "Gen 2022 – Presente" */
    period: string;
    /** AI-reworked description highlighting relevance to the JD */
    description: string;
    /** Relevant skill tags for this JD */
    tags: string[];
}

// ─── Project entry ──────────────────────────────────────────────────────────

export interface N8nProjectItem {
    title: string;
    /** Optional: GitHub URL, company name, client, etc. */
    organization: string;
    /** Human-readable period, e.g. "2023" or "Gen 2022 – Mar 2023" */
    period: string;
    /** AI-reworked description highlighting relevance to the JD */
    description: string;
    /** Tech-stack and skill tags relevant to this JD */
    tags: string[];
}

// ─── Language entry ───────────────────────────────────────────────────────────

export interface N8nLanguageItem {
    name: string;
    /** e.g. "Madrelingua", "C1", "B2" */
    level: string;
    /** 0–100, used for progress bars in templates */
    proficiency: number;
}

// ─── Full generation result ───────────────────────────────────────────────────

export interface N8nGenerationResult {
    /** Static contact block — n8n reads this from the profiles table */
    contact: N8nContactData;
    /** AI-generated professional summary tailored to the JD */
    profile_summary: string;
    /** Work experiences selected and reworked by RAG */
    experiences: N8nExperienceItem[];
    /** Personal / side projects */
    projects: N8nProjectItem[];
    /** Education entries */
    education: N8nExperienceItem[];
    /** Certification entries */
    certifications: N8nExperienceItem[];
    /** Relevant skills extracted/filtered for this JD */
    skills: string[];
    /** Languages from user profile */
    languages: N8nLanguageItem[];
}

