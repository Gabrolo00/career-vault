import { useState, useEffect, useCallback } from 'react';
import { GeneratedDocument, DocumentType } from '../types/database';
import {
    getDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
} from '../services/documentService';
import { triggerGeneration } from '../services/webhookService';
import { supabase } from '../services/supabase';

interface UseDocumentsReturn {
    documents: GeneratedDocument[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    generate: (docType: DocumentType, jdText: string) => Promise<GeneratedDocument>;
    remove: (id: string) => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
    const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDocuments();
            setDocuments(data);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    /**
     * Full generation flow:
     * 1. Insert a `pending` record in Supabase (gives us a documentId)
     * 2. Call n8n webhook with userId + jdText + documentId
     * 3a. If n8n responds synchronously with pdf_url → update record to `completed`
     * 3b. If n8n is fire-and-forget → leave record as `processing`; a Supabase
     *     Realtime subscription (or manual refresh) will pick up the final state
     */
    const generate = useCallback(
        async (docType: DocumentType, jdText: string): Promise<GeneratedDocument> => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            // 1. Create pending record
            let doc = await createDocument(docType, jdText);
            setDocuments((prev) => [doc, ...prev]);

            try {
                // 2. Fire webhook
                const webhookRes = await triggerGeneration({
                    userId: user.id,
                    docType,
                    jobDescription: jdText,
                    requestedAt: new Date().toISOString(),
                    documentId: doc.id,
                });

                // 3a. Synchronous response → update record
                if (webhookRes.pdf_url) {
                    doc = await updateDocument(doc.id, {
                        status: 'completed',
                        pdf_url: webhookRes.pdf_url,
                        webhook_request_id: webhookRes.request_id ?? null,
                    });
                } else {
                    // 3b. Fire-and-forget → mark as processing
                    doc = await updateDocument(doc.id, {
                        status: 'processing',
                        webhook_request_id: webhookRes.request_id ?? null,
                    });
                }
            } catch (webhookErr) {
                // Webhook failed → mark record as failed
                doc = await updateDocument(doc.id, {
                    status: 'failed',
                    error_message: (webhookErr as Error).message,
                });
            }

            setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
            return doc;
        },
        []
    );

    const remove = useCallback(async (id: string) => {
        await deleteDocument(id);
        setDocuments((prev) => prev.filter((d) => d.id !== id));
    }, []);

    return { documents, loading, error, refresh, generate, remove };
}
