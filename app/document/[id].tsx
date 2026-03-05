import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
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

    // HTML fetched from Supabase (used for PDF export)
    const [htmlContent, setHtmlContent] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    // WebView loading state
    const [webLoading, setWebLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await getDocumentById(id);
                setDoc(data);

                // Pre-fetch HTML so we can use it for PDF export without re-downloading
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

    // ── Export PDF ──────────────────────────────────────────────────────────────

    const handleExportPdf = useCallback(async () => {
        const html = htmlContent;
        if (!html) {
            Alert.alert('Errore', 'Contenuto del documento non ancora caricato. Riprova.');
            return;
        }
        try {
            setExporting(true);
            const { uri } = await Print.printToFileAsync({ html, base64: false });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Salva o condividi il PDF',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                Alert.alert('Condivisione non disponibile', `File salvato in: ${uri}`);
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

    // ── Render: Error / not found ───────────────────────────────────────────────

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

    // ── Render: Not completed ───────────────────────────────────────────────────

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

    // ── Render: Document Viewer ─────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <Pressable onPress={() => router.back()} style={styles.navSide}>
                    <Text style={styles.navBack}>← Indietro</Text>
                </Pressable>
                <Text style={styles.navTitle} numberOfLines={1}>
                    {doc.doc_type === 'cv' ? '📄 CV' : '✉️ Cover Letter'}
                </Text>
                <Pressable
                    style={[styles.exportBtn, exporting && { opacity: 0.5 }]}
                    onPress={handleExportPdf}
                    disabled={exporting}
                >
                    {exporting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.exportBtnText}>⬇ PDF</Text>
                    )}
                </Pressable>
            </View>

            {/* WebView renders the HTML document */}
            {webLoading && (
                <View style={styles.webLoadingOverlay}>
                    <ActivityIndicator color={colors.primary} size="large" />
                    <Text style={styles.loadingText}>Rendering documento…</Text>
                </View>
            )}
            <WebView
                source={{ uri: doc.pdf_url }}
                style={styles.webView}
                onLoadEnd={() => setWebLoading(false)}
                onError={(e) => {
                    setWebLoading(false);
                    setError('Errore nel caricamento del documento: ' + e.nativeEvent.description);
                }}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                // Allow the user to scroll the HTML
                scrollEnabled
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    center: {
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
    loadingText: { ...typography.body, color: colors.textMuted },
    errorEmoji: { fontSize: 40 },
    errorText: { ...typography.body, color: colors.error, textAlign: 'center' },
    errorBody: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
    statusTitle: { ...typography.h3, textAlign: 'center' },

    backBtn: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
    },
    backText: { color: colors.primary, fontWeight: '700' },

    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 36,
        paddingBottom: 12,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.bgCard,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    navSide: { width: 80 },
    navBack: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    navTitle: { ...typography.h3, fontSize: 16, flex: 1, textAlign: 'center' },

    exportBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        paddingVertical: 8,
        width: 80,
        alignItems: 'center',
    },
    exportBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    webView: { flex: 1 },

    webLoadingOverlay: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        gap: 12,
    },
});
