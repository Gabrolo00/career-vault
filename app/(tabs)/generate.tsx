import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDocuments } from '../../src/hooks/useDocuments';
import { DocumentType, GeneratedDocument } from '../../src/types/database';
import { colors, radius, spacing, typography } from '../../src/theme';

// ─── Doc type config ──────────────────────────────────────────────────────────

const DOC_TYPES: { value: DocumentType; label: string; emoji: string; desc: string }[] = [
    {
        value: 'cv',
        label: 'Curriculum Vitae',
        emoji: '📄',
        desc: 'CV tailored alla job description tramite RAG sulle tue esperienze',
    },
    {
        value: 'cover_letter',
        label: 'Cover Letter',
        emoji: '✉️',
        desc: 'Lettera di presentazione personalizzata con tono e parole chiave dal JD',
    },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_META: Record<
    GeneratedDocument['status'],
    { label: string; color: string; emoji: string }
> = {
    pending: { label: 'In coda…', color: colors.textMuted, emoji: '⏳' },
    processing: { label: 'Generando…', color: colors.warning, emoji: '⚙️' },
    completed: { label: 'Completato', color: colors.success, emoji: '✅' },
    failed: { label: 'Errore', color: colors.error, emoji: '❌' },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GenerateScreen() {
    const router = useRouter();
    const { generate } = useDocuments();

    const [docType, setDocType] = useState<DocumentType>('cv');
    const [jdText, setJdText] = useState('');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<GeneratedDocument | null>(null);
    const [genError, setGenError] = useState<string | null>(null);

    const canGenerate = jdText.trim().length > 30 && !generating;

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            setGenError(null);
            setResult(null);
            const doc = await generate(docType, jdText.trim());
            setResult(doc);
        } catch (e) {
            setGenError((e as Error).message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>✨ Genera documento</Text>
                <Text style={styles.subtitle}>
                    Incolla una Job Description e lascia che l'AI costruisca il documento perfetto
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Doc type selector */}
                <Text style={styles.sectionLabel}>Tipo di documento</Text>
                <View style={styles.docTypeRow}>
                    {DOC_TYPES.map((dt) => {
                        const active = docType === dt.value;
                        return (
                            <Pressable
                                key={dt.value}
                                style={[styles.docTypeCard, active && styles.docTypeCardActive]}
                                onPress={() => setDocType(dt.value)}
                            >
                                <Text style={styles.docTypeEmoji}>{dt.emoji}</Text>
                                <Text style={[styles.docTypeLabel, active && { color: colors.primary }]}>
                                    {dt.label}
                                </Text>
                                <Text style={styles.docTypeDesc}>{dt.desc}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* JD input */}
                <View style={styles.jdSection}>
                    <View style={styles.jdLabelRow}>
                        <Text style={styles.sectionLabel}>Job Description</Text>
                        {jdText.length > 0 && (
                            <Text style={styles.charCount}>{jdText.length} caratteri</Text>
                        )}
                    </View>
                    <TextInput
                        style={[styles.jdInput, jdText.length > 0 && jdText.length < 30 && styles.jdInputWarn]}
                        placeholder="Incolla qui la job description completa (titolo, azienda, requisiti, responsabilità…)"
                        placeholderTextColor={colors.textPlaceholder}
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                        value={jdText}
                        onChangeText={(t) => {
                            setJdText(t);
                            setResult(null);
                            setGenError(null);
                        }}
                    />
                    {jdText.length > 0 && jdText.length < 30 && (
                        <Text style={styles.warnText}>Inserisci almeno 30 caratteri per procedere</Text>
                    )}
                </View>

                {/* Generate button */}
                <Pressable
                    style={[styles.genBtn, !canGenerate && styles.genBtnDisabled]}
                    onPress={handleGenerate}
                    disabled={!canGenerate}
                >
                    {generating ? (
                        <View style={styles.genBtnInner}>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.genBtnText}>Generando con AI…</Text>
                        </View>
                    ) : (
                        <Text style={styles.genBtnText}>
                            {docType === 'cv' ? '📄' : '✉️'} Genera {DOC_TYPES.find(d => d.value === docType)?.label}
                        </Text>
                    )}
                </Pressable>

                {/* Loading skeleton */}
                {generating && (
                    <View style={styles.loadingCard}>
                        <View style={styles.loadingHeader}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.loadingTitle}>Elaborazione in corso…</Text>
                        </View>
                        <Text style={styles.loadingBody}>
                            L'AI sta analizzando la tua Job Description e le tue esperienze
                            per costruire il documento ottimale. Ci vorrà qualche secondo.
                        </Text>
                        {[0.9, 0.7, 0.5].map((w, i) => (
                            <View key={i} style={[styles.skeletonLine, { width: `${w * 100}%` as any }]} />
                        ))}
                    </View>
                )}

                {/* Error */}
                {genError && !generating && (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorTitle}>❌ Errore durante la generazione</Text>
                        <Text style={styles.errorBody}>{genError}</Text>
                        <Pressable style={styles.retryBtn} onPress={handleGenerate}>
                            <Text style={styles.retryText}>↺ Riprova</Text>
                        </Pressable>
                    </View>
                )}

                {/* Result */}
                {result && !generating && (
                    <ResultCard doc={result} onViewPdf={() => router.push(`/document/${result.id}`)} />
                )}

                {/* Tip */}
                {!generating && !result && !genError && (
                    <View style={styles.tipCard}>
                        <Text style={styles.tipTitle}>💡 Suggerimenti per un buon risultato</Text>
                        <Text style={styles.tipItem}>• Incolla la JD completa, non solo il titolo</Text>
                        <Text style={styles.tipItem}>• Include responsabilità e requisiti tecnici</Text>
                        <Text style={styles.tipItem}>• Più la JD è dettagliata, più il CV è preciso</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// ─── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({
    doc,
    onViewPdf,
}: {
    doc: GeneratedDocument;
    onViewPdf: () => void;
}) {
    const meta = STATUS_META[doc.status];
    return (
        <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
                <Text style={styles.resultEmoji}>{meta.emoji}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.resultStatus, { color: meta.color }]}>{meta.label}</Text>
                    <Text style={styles.resultType}>
                        {doc.doc_type === 'cv' ? '📄 Curriculum Vitae' : '✉️ Cover Letter'}
                    </Text>
                </View>
            </View>

            {doc.status === 'completed' && doc.pdf_url ? (
                <Pressable style={styles.viewPdfBtn} onPress={onViewPdf}>
                    <Text style={styles.viewPdfText}>👁 Visualizza PDF</Text>
                </Pressable>
            ) : doc.status === 'processing' ? (
                <View style={styles.processingNote}>
                    <ActivityIndicator color={colors.warning} size="small" />
                    <Text style={styles.processingText}>
                        n8n sta elaborando… Controlla lo Storico tra poco.
                    </Text>
                </View>
            ) : doc.status === 'failed' ? (
                <Text style={styles.failedText}>{doc.error_message}</Text>
            ) : null}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    title: { ...typography.h2, marginBottom: 6 },
    subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },

    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
    sectionLabel: { ...typography.label, marginBottom: 4 },

    // Doc type selector
    docTypeRow: { flexDirection: 'row', gap: spacing.sm },
    docTypeCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.xs,
    },
    docTypeCardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '12',
    },
    docTypeEmoji: { fontSize: 24 },
    docTypeLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    docTypeDesc: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },

    // JD input
    jdSection: { gap: 6 },
    jdLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    charCount: { fontSize: 11, color: colors.textMuted },
    jdInput: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 14,
        color: colors.textPrimary,
        minHeight: 180,
        lineHeight: 22,
    },
    jdInputWarn: { borderColor: colors.warning },
    warnText: { fontSize: 11, color: colors.warning },

    // Generate button
    genBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 16,
        alignItems: 'center',
    },
    genBtnDisabled: { opacity: 0.4 },
    genBtnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    genBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    // Loading
    loadingCard: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary + '44',
    },
    loadingHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    loadingTitle: { ...typography.bodyBold, color: colors.primary },
    loadingBody: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
    skeletonLine: {
        height: 10,
        backgroundColor: colors.border,
        borderRadius: radius.full,
        marginTop: 4,
    },

    // Error
    errorCard: {
        backgroundColor: colors.errorBg,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.error + '44',
    },
    errorTitle: { fontSize: 15, fontWeight: '700', color: colors.error },
    errorBody: { fontSize: 13, color: '#FCA5A5', lineHeight: 20 },
    retryBtn: {
        backgroundColor: colors.error + '22',
        borderRadius: radius.md,
        paddingVertical: 10,
        alignItems: 'center',
    },
    retryText: { color: colors.error, fontWeight: '700' },

    // Result
    resultCard: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    resultEmoji: { fontSize: 32 },
    resultStatus: { fontSize: 16, fontWeight: '700' },
    resultType: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    viewPdfBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 12,
        alignItems: 'center',
    },
    viewPdfText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    processingNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.warningBg,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    processingText: { flex: 1, fontSize: 13, color: colors.warning },
    failedText: { fontSize: 13, color: colors.error },

    // Tip
    tipCard: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tipTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
    tipItem: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});
