import { supabase } from './supabase';
import { DocumentType, GeneratedDocument, GeneratedDocumentUpdate } from '../types/database';

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getDocuments(): Promise<GeneratedDocument[]> {
    const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as GeneratedDocument[];
}

export async function getDocumentById(id: string): Promise<GeneratedDocument> {
    const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data as GeneratedDocument;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createDocument(
    docType: DocumentType,
    jdText: string
): Promise<GeneratedDocument> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Utente non autenticato');

    const { data, error } = await (supabase
        .from('generated_documents') as any)
        .insert({
            user_id: user.id,
            doc_type: docType,
            jd_text: jdText,
            status: 'pending',
            webhook_request_id: null,
            pdf_url: null,
            error_message: null,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as GeneratedDocument;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateDocument(
    id: string,
    payload: GeneratedDocumentUpdate
): Promise<GeneratedDocument> {
    const { data, error } = await (supabase
        .from('generated_documents') as any)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as GeneratedDocument;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
        .from('generated_documents')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}
