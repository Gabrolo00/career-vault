import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getDocumentById } from '../../src/services/documentService';
import { GeneratedDocument } from '../../src/types/database';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function DocumentViewerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [doc, setDoc] = useState<GeneratedDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [previewing, setPreviewing] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await getDocumentById(id);
                setDoc(data);
                // Pre-fetch HTML so expo-print can use it for PDF export
                if (data?.pdf_url) {
                    const res = await fetch(data.pdf_url);
                    const text = await res.text();
                    setHtmlContent(text);
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // ── Preview (native render via Print) ───────────────────────────────────────

    const handlePreview = useCallback(async () => {
        if (!htmlContent) {
            Alert.alert('Errore', 'Contenuto non ancora caricato. Attendi e riprova.');
            return;
        }
        try {
            setPreviewing(true);
            await Print.printAsync({ html: htmlContent });
        } catch (e) {
            console.log('Preview closed');
        } finally {
            setPreviewing(false);
        }
    }, [htmlContent]);

    // ── Export PDF ──────────────────────────────────────────────────────────────


    const handleExportPdf = useCallback(async () => {
        if (!htmlContent) {
            Alert.alert('Errore', 'Contenuto non ancora caricato. Attendi e riprova.');
            return;
        }
        try {
            setExporting(true);
            const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Salva o condividi il PDF',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('PDF generato', `Salvato in: ${uri}`);
            }
        } catch (e) {
            Alert.alert('Errore esportazione PDF', (e as Error).message);
        } finally {
            setExporting(false);
        }
    }, [htmlContent]);

    // ── Render: Loading ─────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Caricamento documento…</Text>
            </View>
        );
    }

    if (error || !doc) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorEmoji}>⚠️</Text>
                <Text style={styles.errorText}>{error ?? 'Documento non trovato'}</Text>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Torna indietro</Text>
                </Pressable>
            </View>
        );
    }

    if (doc.status !== 'completed' || !doc.pdf_url) {
        return (
            <View style={styles.center}>
                <Text style={{ fontSize: 48 }}>
                    {doc.status === 'processing' ? '⚙️' : doc.status === 'failed' ? '❌' : '⏳'}
                </Text>
                <Text style={styles.statusTitle}>
                    {doc.status === 'processing'
                        ? 'Documento ancora in elaborazione'
                        : doc.status === 'failed'
                            ? 'Generazione fallita'
                            : 'In attesa di elaborazione'}
                </Text>
                {doc.error_message && (
                    <Text style={styles.errorBody}>{doc.error_message}</Text>
                )}
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Torna allo storico</Text>
                </Pressable>
            </View>
        );
    }

    // ── Render: Document Actions ────────────────────────────────────────────────

    const docLabel = doc.doc_type === 'cv' ? 'Curriculum Vitae' : 'Cover Letter';
    const docEmoji = doc.doc_type === 'cv' ? '📄' : '✉️';
    const createdAt = new Date(doc.created_at).toLocaleDateString('it-IT', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Back nav */}
            <Pressable onPress={() => router.back()} style={styles.backNav}>
                <Text style={styles.backNavText}>← Storico</Text>
            </Pressable>

            {/* Document card */}
            <View style={styles.card}>
                <Text style={styles.docEmoji}>{docEmoji}</Text>
                <Text style={styles.docTitle}>{docLabel}</Text>
                <Text style={styles.docDate}>{createdAt}</Text>

                <View style={styles.divider} />

                <Text style={styles.jdLabel}>Job Description:</Text>
                <Text style={styles.jdText} numberOfLines={4}>
                    {doc.jd_text}
                </Text>
            </View>

            {/* Loading HTML indicator */}
            {!htmlContent && (
                <View style={styles.htmlLoadingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.htmlLoadingText}>Preparazione PDF in corso…</Text>
                </View>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
                <Pressable
                    style={[styles.btnPrimary, previewing && styles.btnDisabled]}
                    onPress={handlePreview}
                    disabled={previewing}
                >
                    {previewing
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.btnPrimaryText}>👁  Visualizza documento</Text>
                    }
                </Pressable>

                <Pressable
                    style={[styles.btnSecondary, (!htmlContent || exporting) && styles.btnDisabled]}
                    onPress={handleExportPdf}
                    disabled={!htmlContent || exporting}
                >
                    {exporting
                        ? <ActivityIndicator color={colors.primary} size="small" />
                        : <Text style={styles.btnSecondaryText}>⬇  Scarica PDF</Text>
                    }
                </Pressable>
            </View>

            <Text style={styles.hint}>
                "Visualizza" apre il documento nel browser.{'\n'}
                "Scarica PDF" genera e condivide un PDF nativo.
            </Text>
        </ScrollView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 80 },

    center: {
        flex: 1, backgroundColor: colors.bg,
        alignItems: 'center', justifyContent: 'center',
        padding: spacing.xl, gap: spacing.md,
    },
    loadingText: { ...typography.body, color: colors.textMuted },
    errorEmoji: { fontSize: 40 },
    errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
    errorBody: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
    statusTitle: { ...typography.h3, textAlign: 'center' },

    backBtn: {
        backgroundColor: colors.bgCard, borderRadius: radius.md,
        paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    },
    backText: { color: colors.primary, fontWeight: '700' },

    backNav: { marginTop: Platform.OS === 'ios' ? 52 : 32, marginBottom: 4 },
    backNavText: { color: colors.primary, fontSize: 15, fontWeight: '600' },

    card: {
        backgroundColor: colors.bgCard, borderRadius: radius.xl,
        padding: spacing.lg, gap: spacing.sm,
        borderWidth: 1, borderColor: colors.border,
    },
    docEmoji: { fontSize: 40, textAlign: 'center' },
    docTitle: { ...typography.h2, textAlign: 'center' },
    docDate: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    jdLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
    jdText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },

    htmlLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
    htmlLoadingText: { color: colors.textMuted, fontSize: 13 },

    actions: { gap: spacing.md },

    btnPrimary: {
        backgroundColor: colors.primary, borderRadius: radius.lg,
        paddingVertical: 16, alignItems: 'center',
    },
    btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    btnSecondary: {
        backgroundColor: colors.bgCard, borderRadius: radius.lg,
        paddingVertical: 16, alignItems: 'center',
        borderWidth: 2, borderColor: colors.primary,
    },
    btnSecondaryText: { color: colors.primary, fontWeight: '700', fontSize: 16 },

    btnDisabled: { opacity: 0.4 },

    hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
