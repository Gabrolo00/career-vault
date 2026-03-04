import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// expo-file-system v55 split APIs — the legacy module keeps cacheDirectory + downloadAsync
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDocumentById } from '../../src/services/documentService';
import { GeneratedDocument } from '../../src/types/database';
import { colors, radius, spacing, typography } from '../../src/theme';

// Lazy-import react-native-pdf only when rendering
// This prevents build errors on platforms that don't support it
let Pdf: any;
try {
    Pdf = require('react-native-pdf').default;
} catch {
    Pdf = null;
}

const { width, height } = Dimensions.get('window');

export default function DocumentViewerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [doc, setDoc] = useState<GeneratedDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await getDocumentById(id);
                setDoc(data);
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleShare = async () => {
        if (!doc?.pdf_url) return;
        try {
            setSharing(true);
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                // Download to cache then share
                const cacheDir = FileSystem.cacheDirectory;
                if (!cacheDir) throw new Error('Cache directory non disponibile');
                const localUri = cacheDir + `careervault_${doc.id}.pdf`;
                const { uri } = await FileSystem.downloadAsync(doc.pdf_url, localUri);
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
                }
            } else {
                await Share.share({ url: doc.pdf_url, title: 'CareerVault PDF' });
            }
        } catch (e) {
            console.error('Share error:', e);
        } finally {
            setSharing(false);
        }
    };

    // ── Loading ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Caricamento documento…</Text>
            </View>
        );
    }

    // ── Error / no PDF ──────────────────────────────────────────────────────────

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

    // ── PDF Viewer ───────────────────────────────────────────────────────────────

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
                    style={[styles.shareBtn, sharing && { opacity: 0.5 }]}
                    onPress={handleShare}
                    disabled={sharing}
                >
                    {sharing ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.shareBtnText}>📤 Condividi</Text>
                    )}
                </Pressable>
            </View>

            {/* PDF render */}
            {Pdf ? (
                <Pdf
                    source={{ uri: doc.pdf_url, cache: true }}
                    style={styles.pdf}
                    onError={(err: any) => setError(String(err))}
                    trustAllCerts={false}
                    enablePaging
                    horizontal={false}
                />
            ) : (
                // Fallback for platforms where react-native-pdf is unavailable (e.g., Expo Go web)
                <View style={styles.center}>
                    <Text style={{ fontSize: 40 }}>📄</Text>
                    <Text style={styles.statusTitle}>PDF pronto</Text>
                    <Text style={styles.errorBody}>
                        Il visualizzatore PDF richiede una build nativa.{'\n'}
                        Usa "Condividi" per aprire il file.
                    </Text>
                    <Pressable style={styles.shareBtn} onPress={handleShare}>
                        <Text style={styles.shareBtnText}>📤 Condividi PDF</Text>
                    </Pressable>
                </View>
            )}
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
        paddingTop: 56,
        paddingBottom: 12,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.bgCard,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    navSide: { width: 80 },
    navBack: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    navTitle: { ...typography.h3, fontSize: 16, flex: 1, textAlign: 'center' },
    shareBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        paddingVertical: 8,
        width: 110,
        alignItems: 'center',
    },
    shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    pdf: {
        flex: 1,
        width,
        height,
        backgroundColor: '#1a1a2e',
    },
});
