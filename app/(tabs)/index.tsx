import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useExperiences } from '../../src/hooks/useExperiences';
import { ExperienceCard } from '../../src/components/ExperienceCard';
import { colors, radius, spacing, TYPE_META } from '../../src/theme';
import { ExperienceType } from '../../src/types/database';

const ALL_FILTER = 'all';
type FilterValue = ExperienceType | typeof ALL_FILTER;

const TYPE_FILTERS: { value: FilterValue; label: string; emoji: string }[] = [
    { value: ALL_FILTER, label: 'Tutti', emoji: '⚡' },
    ...Object.entries(TYPE_META).map(([k, v]) => ({
        value: k as ExperienceType,
        label: v.label,
        emoji: v.emoji,
    })),
];

export default function VaultScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { experiences, loading, error, refresh } = useExperiences();

    const [activeFilter, setActiveFilter] = useState<FilterValue>(ALL_FILTER);
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = experiences.filter((e) => {
        const matchType = activeFilter === ALL_FILTER || e.type === activeFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            e.title.toLowerCase().includes(q) ||
            (e.organization ?? '').toLowerCase().includes(q) ||
            e.skills.some((s) => s.toLowerCase().includes(q));
        return matchType && matchSearch;
    });

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? 'ciao';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>👋 Ciao, {firstName}</Text>
                    <Text style={styles.headline}>Il tuo Vault</Text>
                </View>
                <Pressable
                    style={styles.addBtn}
                    onPress={() => router.push('/experience/new')}
                >
                    <Text style={styles.addBtnText}>+ Aggiungi</Text>
                </Pressable>
            </View>

            {/* Stats bar */}
            <View style={styles.statsBar}>
                <StatChip label="Esperienze" value={experiences.length} />
                <StatChip label="Skills" value={[...new Set(experiences.flatMap((e) => e.skills))].length} />
                <StatChip label="Anni" value={uniqueYears(experiences)} />
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cerca titolo, azienda, skill…"
                    placeholderTextColor={colors.textPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Text style={styles.searchClear}>✕</Text>
                    </Pressable>
                )}
            </View>

            {/* Type filters */}
            <FlatList
                data={TYPE_FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                    const isActive = activeFilter === item.value;
                    const color = item.value === ALL_FILTER
                        ? colors.primary
                        : TYPE_META[item.value as ExperienceType]?.color ?? colors.primary;
                    return (
                        <Pressable
                            style={[
                                styles.filter,
                                isActive && { backgroundColor: color + '25', borderColor: color },
                            ]}
                            onPress={() => setActiveFilter(item.value)}
                        >
                            <Text style={styles.filterEmoji}>{item.emoji}</Text>
                            <Text style={[styles.filterLabel, isActive && { color }]}>
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* List */}
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
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ExperienceCard experience={item} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>
                                {searchQuery || activeFilter !== ALL_FILTER ? '🔍' : '🗄️'}
                            </Text>
                            <Text style={styles.emptyTitle}>
                                {searchQuery || activeFilter !== ALL_FILTER
                                    ? 'Nessun risultato'
                                    : 'Il tuo Vault è vuoto'}
                            </Text>
                            <Text style={styles.emptyBody}>
                                {searchQuery || activeFilter !== ALL_FILTER
                                    ? 'Prova a cambiare filtri o ricerca'
                                    : 'Aggiungi la tua prima esperienza!'}
                            </Text>
                            {!searchQuery && activeFilter === ALL_FILTER && (
                                <Pressable
                                    style={styles.addBtnLarge}
                                    onPress={() => router.push('/experience/new')}
                                >
                                    <Text style={styles.addBtnLargeText}>+ Aggiungi esperienza</Text>
                                </Pressable>
                            )}
                        </View>
                    }
                />
            )}
        </View>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calcola gli anni totali di esperienza sommando la durata di ogni voce.
 * Per esperienze in corso usa la data attuale come fine.
 */
function uniqueYears(exps: ReturnType<typeof useExperiences>['experiences']): number {
    const now = new Date();
    let totalMs = 0;
    exps.forEach((e) => {
        if (!e.start_date) return;
        const start = new Date(e.start_date);
        const end = e.is_current || !e.end_date ? now : new Date(e.end_date);
        totalMs += Math.max(0, end.getTime() - start.getTime());
    });
    // Converti in anni (365.25 giorni) e arrotonda all'intero più vicino
    return Math.round(totalMs / (1000 * 60 * 60 * 24 * 365.25));
}

function StatChip({ label, value }: { label: string; value: number }) {
    return (
        <View style={styles.statChip}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.md,
    },
    greeting: { fontSize: 14, color: colors.textMuted, marginBottom: 2 },
    headline: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
    addBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Stats
    statsBar: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    statChip: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: radius.md,
        padding: spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
    statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },

    // Search
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 15,
        paddingVertical: 12,
    },
    searchClear: { color: colors.textMuted, fontSize: 16, paddingHorizontal: 4 },

    // Filters
    filtersRow: {
        paddingHorizontal: spacing.lg,
        gap: spacing.xs,
        paddingBottom: spacing.sm,
    },
    filter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.bgCard,
        borderRadius: radius.full,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.xs,
    },
    filterEmoji: { fontSize: 13 },
    filterLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },

    // List
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },

    // States
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    errorText: { color: colors.error, fontSize: 15 },
    retryBtn: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    retryText: { color: colors.primary, fontWeight: '700' },
    empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    emptyBody: { fontSize: 15, color: colors.textMuted, textAlign: 'center', maxWidth: 280 },
    addBtnLarge: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    addBtnLargeText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
