import { DocumentType } from '../types/database';

const WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;

// ─── Payload ──────────────────────────────────────────────────────────────────

/** Info profilo minime incluse nel payload per n8n */
export interface ProfileSnapshot {
    fullName: string | null;
    headline: string | null;
    phone: string | null;
    city: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    avatarUrl: string | null;
}

export interface WebhookPayload {
    userId: string;
    docType: DocumentType;
    jobDescription: string;
    /** ISO timestamp of the request */
    requestedAt: string;
    /** Supabase document record ID (so n8n can update it when done) */
    documentId: string;
    /** v2 — Template CV scelto dall'utente */
    templateId: string;
    /**
     * v2 — Full HTML string of the chosen CV template.
     * n8n should substitute the {{placeholders}} before rendering to PDF.
     * Placeholder list: {{full_name}}, {{headline}}, {{city}}, {{phone}},
     * {{linkedin_url}}, {{portfolio_url}}, {{avatar_url}}, {{initials}},
     * {{first_name}}, {{last_name}}, {{profile_summary}},
     * {{experiences_html}}, {{education_html}}, {{certifications_html}},
     * {{skills_list}}, {{skills_section_html}}, {{languages_html}}
     */
    templateHtml?: string;
    /** v2 — Snapshot del profilo utente per la generazione */
    profile: ProfileSnapshot | null;
}

export interface WebhookResponse {
    /** URL of the generated PDF, returned by n8n */
    pdf_url?: string;
    /** Optional request reference ID for tracking */
    request_id?: string;
    /** Error message if the webhook returned a failure */
    error?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Calls the n8n webhook to trigger the AI generation pipeline.
 *
 * n8n is expected to:
 * 1. Receive the payload
 * 2. Run RAG over the user's experiences (via pgvector)
 * 3. Generate CV / Cover Letter via LLM using the chosen template
 * 4. Upload the PDF to Supabase Storage
 * 5. Return { pdf_url, request_id } in the HTTP response
 *    (or update the generated_documents row directly via Supabase API)
 */
export async function triggerGeneration(
    payload: WebhookPayload
): Promise<WebhookResponse> {
    if (!WEBHOOK_URL) {
        throw new Error(
            'EXPO_PUBLIC_N8N_WEBHOOK_URL non configurata. ' +
            'Aggiungila al tuo file .env prima di procedere.'
        );
    }

    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => 'Nessun body');
        throw new Error(`Webhook error ${response.status}: ${text}`);
    }

    // n8n may return an empty 200 (fire-and-forget mode) or a JSON response
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return (await response.json()) as WebhookResponse;
    }

    // Fire-and-forget: no PDF url yet; polling or realtime will update the record
    return {};
}
