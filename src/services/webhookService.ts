import { DocumentType } from '../types/database';
import { N8nGenerationResult } from '../types/generation';

const WEBHOOK_URL = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.EXPO_PUBLIC_N8N_WEBHOOK_SECRET ?? '';

// ─── Payload ──────────────────────────────────────────────────────────────────

/**
 * Minimal payload sent to n8n.
 * n8n is responsible for querying Supabase directly for profile data and
 * experiences. The app never sends HTML.
 */
export interface WebhookPayload {
    userId: string;
    documentId: string;
    docType: DocumentType;
    jobDescription: string;
    templateId: string;
    requestedAt: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

/**
 * n8n returns a structured JSON object — no PDF URL, no HTML.
 * The app injects this into the local template and generates the PDF on-device.
 */
export type WebhookResponse = N8nGenerationResult;

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Calls the n8n webhook to trigger the AI text-generation pipeline.
 *
 * n8n is expected to:
 * 1. Receive { userId, documentId, docType, jobDescription, templateId }
 * 2. Query Supabase for the user's profile and experiences
 * 3. Run RAG over experiences (pgvector) to select relevant ones
 * 4. Generate tailored text via LLM
 * 5. Return an N8nGenerationResult JSON synchronously
 *    (and optionally write it to generated_documents.generated_content via Supabase API)
 */
export async function triggerGeneration(
    payload: WebhookPayload
): Promise<WebhookResponse | null> {
    if (!WEBHOOK_URL) {
        throw new Error(
            'EXPO_PUBLIC_N8N_WEBHOOK_URL non configurata. ' +
            'Aggiungila al tuo file .env prima di procedere.'
        );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    let response: Response;
    try {
        response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'x-internal-secret': WEBHOOK_SECRET,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
            throw new Error('Il webhook n8n non ha risposto entro 60 secondi. Riprova più tardi.');
        }
        throw e;
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const text = await response.text().catch(() => 'Nessun body');
        throw new Error(`Webhook error ${response.status}: ${text}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return (await response.json()) as WebhookResponse;
    }

    // Fire-and-forget mode: n8n will write generated_content to Supabase directly
    return null;
}
