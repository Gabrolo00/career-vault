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
    generate: (docType: DocumentType, jdText: string, title: string, templateId?: string) => Promise<GeneratedDocument>;
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
     * Generation flow (JSON-first architecture):
     * 1. Insert a `pending` record in Supabase
     * 2. Call n8n with a minimal payload — NO HTML, NO profile snapshot
     *    n8n queries Supabase directly for profile + experiences
     * 3a. If n8n responds synchronously with N8nGenerationResult JSON:
     *     → Store JSON in generated_content, mark as `completed`
     * 3b. If n8n is fire-and-forget (null response):
     *     → Leave as `processing`; n8n will update the record via Supabase API
     */
    const generate = useCallback(
        async (
            docType: DocumentType,
            jdText: string,
            title: string,
            templateId = 'modern'
        ): Promise<GeneratedDocument> => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Utente non autenticato');

            // 1. Create pending record
            let doc = await createDocument(docType, jdText, title, templateId);
            setDocuments((prev) => [doc, ...prev]);

            try {
                // 2. Fire webhook — minimal payload, no HTML
                const generationResult = await triggerGeneration({
                    userId: user.id,
                    documentId: doc.id,
                    docType,
                    jobDescription: jdText,
                    templateId,
                    requestedAt: new Date().toISOString(),
                });

                if (generationResult) {
                    // 3a. Synchronous response → store JSON and mark completed
                    doc = await updateDocument(doc.id, {
                        status: 'completed',
                        generated_content: generationResult as any,
                    });
                } else {
                    // 3b. Fire-and-forget → n8n will update the record directly
                    doc = await updateDocument(doc.id, { status: 'processing' });
                }
            } catch (webhookErr) {
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
