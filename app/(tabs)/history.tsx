import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDocuments } from '../../src/hooks/useDocuments';
import { GeneratedDocument } from '../../src/types/database';
import { colors, radius, spacing, typography } from '../../src/theme';

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<
    GeneratedDocument['status'],
    { label: string; color: string; bgColor: string; emoji: string }
> = {
    pending: { label: 'In coda', color: colors.textMuted, bgColor: colors.bgCard, emoji: '⏳' },
    processing: { label: 'Elaborando', color: colors.warning, bgColor: colors.warningBg, emoji: '⚙️' },
    completed: { label: 'Completato', color: colors.success, bgColor: colors.successBg, emoji: '✅' },
    failed: { label: 'Errore', color: colors.error, bgColor: colors.errorBg, emoji: '❌' },
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
    const router = useRouter();
    const { documents, loading, error, refresh, remove } = useDocuments();

    const onDelete = (doc: GeneratedDocument) => {
        Alert.alert(
            'Elimina documento',
            `Vuoi eliminare questo ${doc.doc_type === 'cv' ? 'CV' : 'Cover Letter'}?`,
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: () => remove(doc.id),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>📄 Storico generazioni</Text>
                <Text style={styles.subtitle}>
                    {documents.length} document{documents.length !== 1 ? 'i' : 'o'} generato
                    {documents.length !== 1 ? '' : ''}
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <Pressable style={styles.retryBtn} onPress={refresh}>
                        <Text style={styles.retryText}>Riprova</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={documents}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            tintColor={colors.primary}
                        />
                    }
                    renderItem={({ item }) => (
                        <DocumentRow
                            doc={item}
                            onPress={() => item.status === 'completed' && router.push(`/document/${item.id}`)}
                            onDelete={() => onDelete(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>📭</Text>
                            <Text style={styles.emptyTitle}>Nessun documento ancora</Text>
                            <Text style={styles.emptyBody}>
                                Vai su "Genera" e crea il tuo primo CV o Cover Letter
                            </Text>
                            <Pressable
                                style={styles.goGenBtn}
                                onPress={() => router.push('/(tabs)/generate')}
                            >
                                <Text style={styles.goGenText}>✨ Vai a Genera</Text>
                            </Pressable>
                        </View>
                    }
                />
            )}
        </View>
    );
}

// ─── DocumentRow ──────────────────────────────────────────────────────────────

function DocumentRow({
    doc,
    onPress,
    onDelete,
}: {
    doc: GeneratedDocument;
    onPress: () => void;
    onDelete: () => void;
}) {
    const status = STATUS_META[doc.status];
    const createdAt = new Date(doc.created_at).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
            onPress={onPress}
            disabled={doc.status !== 'completed'}
        >
            {/* Left: type icon */}
            <View style={styles.rowIcon}>
                <Text style={styles.rowIconText}>
                    {doc.doc_type === 'cv' ? '📄' : '✉️'}
                </Text>
            </View>

            {/* Center: info */}
            <View style={styles.rowInfo}>
                <Text style={styles.rowType}>
                    {doc.doc_type === 'cv' ? 'Curriculum Vitae' : 'Cover Letter'}
                </Text>
                <Text style={styles.rowJd} numberOfLines={1}>
                    {doc.jd_snippet ?? doc.jd_text.slice(0, 60)}
                </Text>
                <Text style={styles.rowDate}>{createdAt}</Text>
            </View>

            {/* Right: status badge + delete */}
            <View style={styles.rowRight}>
                <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                    <Text style={styles.statusEmoji}>{status.emoji}</Text>
                    <Text style={[styles.statusLabel, { color: status.color }]}>
                        {status.label}
                    </Text>
                </View>
                <Pressable style={styles.deleteIcon} onPress={onDelete}>
                    <Text style={{ color: colors.error, fontSize: 16 }}>🗑</Text>
                </Pressable>
            </View>
        </Pressable>
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
    title: { ...typography.h2, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.textMuted },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    errorText: { color: colors.error, fontSize: 15 },
    retryBtn: { backgroundColor: colors.bgCard, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 10 },
    retryText: { color: colors.primary, fontWeight: '700' },

    listContent: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.md,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    rowIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowIconText: { fontSize: 22 },
    rowInfo: { flex: 1, gap: 3 },
    rowType: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
    rowJd: { fontSize: 12, color: colors.textMuted },
    rowDate: { fontSize: 11, color: colors.textMuted + '88' },
    rowRight: { alignItems: 'flex-end', gap: 8 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        borderRadius: radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusEmoji: { fontSize: 11 },
    statusLabel: { fontSize: 10, fontWeight: '700' },
    deleteIcon: { padding: 4 },

    // Empty state
    empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    emptyBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
    goGenBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 28, paddingVertical: 13, marginTop: spacing.sm },
    goGenText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
