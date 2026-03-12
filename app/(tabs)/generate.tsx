import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useDocuments } from '../../src/hooks/useDocuments';
import { useProfile } from '../../src/hooks/useProfile';
import { useExperiences } from '../../src/hooks/useExperiences';
import { DocumentType, GeneratedDocument } from '../../src/types/database';
import { colors, radius, spacing, typography, STATUS_ICONS, DOC_TYPE_ICONS, SCREEN_PADDING_BOTTOM } from '../../src/theme';

// ─── Doc type config ──────────────────────────────────────────────────────────

const DOC_TYPES: { value: DocumentType; label: string; iconName: string; desc: string }[] = [
    {
        value: 'cv',
        label: 'Curriculum Vitae',
        iconName: 'document-text',
        desc: 'CV tailored alla job description tramite RAG sulle tue esperienze',
    },
    {
        value: 'cover_letter',
        label: 'Cover Letter',
        iconName: 'mail',
        desc: 'Lettera di presentazione personalizzata con tono e parole chiave dal JD',
    },
];

// ─── CV Template config ───────────────────────────────────────────────────────

export type TemplateId = 'modern' | 'minimal' | 'creative';

interface TemplateOption {
    id: TemplateId;
    label: string;
    emoji: string;
    accent: string;
    desc: string;
}

const CV_TEMPLATES: TemplateOption[] = [
    {
        id: 'modern',
        label: 'Moderno',
        emoji: '⚡',
        accent: colors.primary,
        desc: 'Struttura pulita con accenti blu. Ideale per tech e startup.',
    },
    {
        id: 'minimal',
        label: 'Minimal',
        emoji: '◻',
        accent: colors.textSecondary,
        desc: 'Bianco e nero elegante. Perfetto per ambienti corporate.',
    },
    {
        id: 'creative',
        label: 'Creativo',
        emoji: '🎨',
        accent: colors.project,
        desc: 'Layout audace con sidebar colorata. Per design e marketing.',
    },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

// ─── Readiness modal ──────────────────────────────────────────────────────────

type ReadinessIssue = 'profile' | 'vault' | 'both';

function ReadinessModal({
    visible,
    issue,
    onGoProfile,
    onGoVault,
    onDismiss,
}: {
    visible: boolean;
    issue: ReadinessIssue;
    onGoProfile: () => void;
    onGoVault: () => void;
    onDismiss: () => void;
}) {
    const showProfile = issue === 'profile' || issue === 'both';
    const showVault = issue === 'vault' || issue === 'both';

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
            <Pressable style={modalStyles.overlay} onPress={onDismiss}>
                <Pressable style={modalStyles.card} onPress={() => {}}>
                    <View style={modalStyles.iconRow}>
                        <View style={modalStyles.iconWrap}>
                            <Ionicons name="alert-circle-outline" size={32} color={colors.warning} />
                        </View>
                    </View>

                    <Text style={modalStyles.title}>Profilo Incompleto</Text>
                    <Text style={modalStyles.body}>
                        Per permettere all'AI di generare un documento efficace, assicurati di aver:
                    </Text>

                    <View style={modalStyles.checkList}>
                        {showProfile && (
                            <View style={modalStyles.checkRow}>
                                <Ionicons name="close-circle" size={16} color={colors.error} />
                                <Text style={modalStyles.checkText}>
                                    Compilato i tuoi dati personali nel Profilo (nome e ruolo)
                                </Text>
                            </View>
                        )}
                        {showVault && (
                            <View style={modalStyles.checkRow}>
                                <Ionicons name="close-circle" size={16} color={colors.error} />
                                <Text style={modalStyles.checkText}>
                                    Aggiunto almeno un'esperienza nel Vault
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={modalStyles.actions}>
                        {showProfile && (
                            <Pressable style={modalStyles.btnPrimary} onPress={onGoProfile}>
                                <Ionicons name="person-outline" size={16} color="#fff" />
                                <Text style={modalStyles.btnPrimaryText}>Vai al Profilo</Text>
                            </Pressable>
                        )}
                        {showVault && (
                            <Pressable style={modalStyles.btnSecondary} onPress={onGoVault}>
                                <Ionicons name="server-outline" size={16} color={colors.primary} />
                                <Text style={modalStyles.btnSecondaryText}>Vai al Vault</Text>
                            </Pressable>
                        )}
                        <Pressable style={modalStyles.btnGhost} onPress={onDismiss}>
                            <Text style={modalStyles.btnGhostText}>Annulla</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GenerateScreen() {
    const router = useRouter();
    const { generate } = useDocuments();
    const { profile, loading: profileLoading, refresh: refreshProfile } = useProfile();
    const { experiences, loading: expLoading, refresh: refreshExperiences } = useExperiences();

    // Refresh both on every focus so the check uses live DB data
    useFocusEffect(useCallback(() => {
        refreshProfile();
        refreshExperiences();
    }, []));

    const [docType, setDocType] = useState<DocumentType>('cv');
    const [docTitle, setDocTitle] = useState('');
    const [templateId, setTemplateId] = useState<TemplateId>('modern');
    const [jdText, setJdText] = useState('');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<GeneratedDocument | null>(null);
    const [genError, setGenError] = useState<string | null>(null);
    const [readinessIssue, setReadinessIssue] = useState<ReadinessIssue | null>(null);

    // Only check once data has loaded — avoid false negatives during mount
    const readinessReady = !profileLoading && !expLoading;
    const profileComplete = !!(profile?.full_name?.trim() && profile?.headline?.trim());
    const hasExperiences = experiences.length > 0;
    const canGenerate = jdText.trim().length > 30 && docTitle.trim().length > 0 && !generating;

    const handleGenerate = async () => {
        // Pre-generation readiness check (skip if still loading)
        if (readinessReady && (!profileComplete || !hasExperiences)) {
            if (!profileComplete && !hasExperiences) setReadinessIssue('both');
            else if (!profileComplete) setReadinessIssue('profile');
            else setReadinessIssue('vault');
            return;
        }

        try {
            setGenerating(true);
            setGenError(null);
            setResult(null);
            const doc = await generate(docType, jdText.trim(), docTitle.trim(), templateId);
            setResult(doc);
        } catch (e) {
            setGenError((e as Error).message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Readiness modal */}
            {readinessIssue && (
                <ReadinessModal
                    visible
                    issue={readinessIssue}
                    onGoProfile={() => { setReadinessIssue(null); router.push('/(tabs)/profile'); }}
                    onGoVault={() => { setReadinessIssue(null); router.push('/(tabs)'); }}
                    onDismiss={() => setReadinessIssue(null)}
                />
            )}

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Genera documento</Text>
                <Text style={styles.subtitle}>
                    Incolla una Job Description e lascia che l'AI costruisca il documento perfetto
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Title input */}
                <View style={styles.jdSection}>
                    <Text style={styles.sectionLabel}>Nome del documento</Text>
                    <TextInput
                        style={styles.jdInputShort}
                        placeholder="Es. CV per Meta, Lettera Google…"
                        placeholderTextColor={colors.textPlaceholder}
                        value={docTitle}
                        onChangeText={setDocTitle}
                    />
                </View>

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
                                <Ionicons
                                    name={dt.iconName as any}
                                    size={28}
                                    color={active ? colors.primary : colors.textMuted}
                                />
                                <Text style={[styles.docTypeLabel, active && { color: colors.primary }]}>
                                    {dt.label}
                                </Text>
                                <Text style={styles.docTypeDesc}>{dt.desc}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Template selector — solo per CV */}
                {docType === 'cv' && (
                    <View style={styles.templateSection}>
                        <Text style={styles.sectionLabel}>Template CV</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.templateRow}
                        >
                            {CV_TEMPLATES.map((tpl) => {
                                const active = templateId === tpl.id;
                                return (
                                    <Pressable
                                        key={tpl.id}
                                        style={[
                                            styles.templateCard,
                                            active && {
                                                borderColor: tpl.accent,
                                                backgroundColor: tpl.accent + '18',
                                            },
                                        ]}
                                        onPress={() => setTemplateId(tpl.id)}
                                    >
                                        {/* Top accent bar */}
                                        <View
                                            style={[
                                                styles.templateAccentBar,
                                                { backgroundColor: tpl.accent },
                                            ]}
                                        />
                                        {/* Active indicator */}
                                        {active && (
                                            <View style={[styles.templateCheck, { backgroundColor: tpl.accent }]}>
                                                <Ionicons name="checkmark" size={11} color="#fff" />
                                            </View>
                                        )}
                                        <Text style={styles.templateEmoji}>{tpl.emoji}</Text>
                                        <Text
                                            style={[
                                                styles.templateLabel,
                                                active && { color: tpl.accent },
                                            ]}
                                        >
                                            {tpl.label}
                                        </Text>
                                        <Text style={styles.templateDesc}>{tpl.desc}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

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
                    style={[styles.genBtn, (!canGenerate) && styles.genBtnDisabled]}
                    onPress={handleGenerate}
                    disabled={!canGenerate}
                >
                    {generating ? (
                        <View style={styles.genBtnInner}>
                            <ActivityIndicator color="#fff" />
                            <Text style={styles.genBtnText}>Generando con AI…</Text>
                        </View>
                    ) : (
                        <View style={styles.genBtnInner}>
                            <Ionicons name={DOC_TYPE_ICONS[docType] as any} size={18} color="#fff" />
                            <Text style={styles.genBtnText}>
                                Genera {DOC_TYPES.find(d => d.value === docType)?.label}
                            </Text>
                        </View>
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
                        <View style={styles.errorTitleRow}>
                            <Ionicons name="close-circle" size={18} color={colors.error} />
                            <Text style={styles.errorTitle}>Errore durante la generazione</Text>
                        </View>
                        <Text style={styles.errorBody}>{genError}</Text>
                        <Pressable style={styles.retryBtn} onPress={handleGenerate}>
                            <Ionicons name="refresh" size={14} color={colors.error} />
                            <Text style={styles.retryText}>Riprova</Text>
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
                        <View style={styles.tipTitleRow}>
                            <Ionicons name="bulb-outline" size={15} color={colors.textSecondary} />
                            <Text style={styles.tipTitle}>Suggerimenti per un buon risultato</Text>
                        </View>
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
    const status = STATUS_ICONS[doc.status];
    return (
        <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
                <Ionicons name={status.iconName as any} size={32} color={status.color} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.resultStatus, { color: status.color }]}>{status.label}</Text>
                    <View style={styles.resultTypeRow}>
                        <Ionicons
                            name={DOC_TYPE_ICONS[doc.doc_type] as any}
                            size={13}
                            color={colors.textMuted}
                        />
                        <Text style={styles.resultType}>
                            {doc.doc_type === 'cv' ? 'Curriculum Vitae' : 'Cover Letter'}
                        </Text>
                    </View>
                </View>
            </View>

            {doc.status === 'completed' && doc.generated_content ? (
                <Pressable style={styles.viewPdfBtn} onPress={onViewPdf}>
                    <Ionicons name="eye" size={16} color="#fff" />
                    <Text style={styles.viewPdfText}>Visualizza documento</Text>
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

    content: { padding: spacing.lg, gap: spacing.md, paddingBottom: SCREEN_PADDING_BOTTOM },
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
    docTypeLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    docTypeDesc: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },

    // Template selector
    templateSection: { gap: 6 },
    templateRow: {
        gap: spacing.sm,
        paddingRight: spacing.sm,
    },
    templateCard: {
        width: 148,
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1.5,
        borderColor: colors.border,
        gap: spacing.xs,
        overflow: 'hidden',
        position: 'relative',
    },
    templateAccentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
    },
    templateCheck: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateEmoji: { fontSize: 26, marginTop: 6 },
    templateLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    templateDesc: {
        fontSize: 11,
        color: colors.textMuted,
        lineHeight: 16,
    },

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
    jdInputShort: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: 14,
        color: colors.textPrimary,
        height: 50,
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
    errorTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    errorTitle: { fontSize: 15, fontWeight: '700', color: colors.error },
    errorBody: { fontSize: 13, color: '#FCA5A5', lineHeight: 20 },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.error + '22',
        borderRadius: radius.md,
        paddingVertical: 10,
        justifyContent: 'center',
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
    resultStatus: { fontSize: 16, fontWeight: '700' },
    resultTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    resultType: { fontSize: 13, color: colors.textMuted },
    viewPdfBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 12,
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
    tipTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    tipTitle: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
    tipItem: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        width: '100%',
        backgroundColor: colors.bgCard,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
    },
    iconRow: { alignItems: 'center' },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.warningBg,
        borderWidth: 1,
        borderColor: colors.warning + '40',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    body: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
        textAlign: 'center',
    },
    checkList: { gap: spacing.sm },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        backgroundColor: colors.errorBg,
        borderRadius: radius.md,
        padding: spacing.sm,
    },
    checkText: {
        flex: 1,
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    actions: { gap: spacing.sm, marginTop: spacing.xs },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingVertical: 14,
    },
    btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    btnSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.bgCardAlt,
        borderRadius: radius.lg,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.primary + '60',
    },
    btnSecondaryText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
    btnGhost: { alignItems: 'center', paddingVertical: 10 },
    btnGhostText: { color: colors.textMuted, fontSize: 14 },
});
