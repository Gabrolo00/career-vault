import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useExperiences } from '../../src/hooks/useExperiences';
import { ExperienceCard } from '../../src/components/ExperienceCard';
import { colors, radius, spacing, TYPE_META, SCREEN_PADDING_BOTTOM } from '../../src/theme';
import { ExperienceType } from '../../src/types/database';

const ALL_FILTER = 'all';
type FilterValue = ExperienceType | typeof ALL_FILTER;

const TYPE_FILTERS: { value: FilterValue; label: string; iconName: string }[] = [
    { value: ALL_FILTER, label: 'Tutti', iconName: 'apps' },
    ...Object.entries(TYPE_META).map(([k, v]) => ({
        value: k as ExperienceType,
        label: v.label,
        iconName: v.iconName,
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

    // 4 stat values
    const countWork = experiences.filter(e => e.type === 'work').length;
    const countEdu = experiences.filter(e => e.type === 'education').length;
    const countProject = experiences.filter(e => e.type === 'project').length;
    const uniqueSkills = [...new Set(experiences.flatMap(e => e.skills))].length;

    return (
        <View style={styles.container}>
            {/* Header — compact */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Ciao, {firstName}</Text>
                    <Text style={styles.headline}>Il tuo Vault</Text>
                </View>
                <Pressable style={styles.addBtn} onPress={() => router.push('/experience/new')}>
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.addBtnText}>Aggiungi</Text>
                </Pressable>
            </View>

            {/* 4 Stat cards */}
            <View style={styles.statsRow}>
                <StatCard label="Esperienze" value={countWork} iconName="briefcase" color={colors.primary} />
                <StatCard label="Formazione" value={countEdu} iconName="school" color={colors.secondary} />
                <StatCard label="Progetti" value={countProject} iconName="rocket" color={colors.project} />
                <StatCard label="Competenze" value={uniqueSkills} iconName="ribbon" color={colors.certification} />
            </View>

            {/* Search — pill */}
            <View style={styles.searchWrapper}>
                <Ionicons name="search" size={16} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cerca nel Vault…"
                    placeholderTextColor={colors.textPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={17} color={colors.textMuted} />
                    </Pressable>
                )}
            </View>

            {/* Filter pills */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersRow}
                >
                    {TYPE_FILTERS.map((item) => {
                        const isActive = activeFilter === item.value;
                        const acc = item.value === ALL_FILTER
                            ? colors.primary
                            : TYPE_META[item.value as ExperienceType]?.color ?? colors.primary;
                        return (
                            <Pressable
                                key={item.value}
                                style={[styles.filter, isActive && { backgroundColor: acc, borderColor: acc }]}
                                onPress={() => setActiveFilter(item.value)}
                            >
                                <Ionicons name={item.iconName as any} size={12} color={isActive ? '#fff' : colors.textMuted} />
                                <Text style={[styles.filterLabel, isActive && { color: '#fff' }]}>{item.label}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Experience list */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Ionicons name="warning" size={28} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
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
                        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons
                                name={searchQuery || activeFilter !== ALL_FILTER ? 'search-outline' : 'file-tray-outline'}
                                size={48}
                                color={colors.textMuted}
                            />
                            <Text style={styles.emptyTitle}>
                                {searchQuery || activeFilter !== ALL_FILTER ? 'Nessun risultato' : 'Il tuo Vault è vuoto'}
                            </Text>
                            <Text style={styles.emptyBody}>
                                {searchQuery || activeFilter !== ALL_FILTER
                                    ? 'Prova a cambiare filtri o ricerca'
                                    : 'Aggiungi la tua prima esperienza!'}
                            </Text>
                            {!searchQuery && activeFilter === ALL_FILTER && (
                                <Pressable style={styles.addBtnLarge} onPress={() => router.push('/experience/new')}>
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

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, iconName, color }: { label: string; value: number; iconName: string; color: string }) {
    return (
        <View style={[
            styles.statCard,
            {
                borderTopColor: color,          // bright top glow line
                borderLeftColor: color + '20',
                borderRightColor: color + '20',
                borderBottomColor: color + '20',
                // Soft colored shadow (iOS)
                shadowColor: color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 4,
            }
        ]}>
            <View style={[styles.statIconWrap, { backgroundColor: color + '20' }]}>
                <Ionicons name={iconName as any} size={20} color={color} />
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    // Header — compact (reduced paddingTop)
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingTop: 48,
        paddingBottom: spacing.sm,
    },
    greeting: { fontSize: 13, color: colors.textMuted, marginBottom: 1 },
    headline: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // 4 stat cards — compact
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        paddingVertical: 12,
        paddingHorizontal: 6,
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
    },
    statIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: { fontSize: 20, fontWeight: '800' },
    statLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },

    // Search — pill, compact
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xs,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        height: 44,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
    },

    // Filters — compact height
    filtersContainer: { height: 46, marginBottom: 4 },
    filtersRow: {
        paddingHorizontal: spacing.lg,
        gap: spacing.xs,
        alignItems: 'center',
        height: 46,
    },
    filter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.bgCard,
        borderRadius: radius.full,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderWidth: 1.5,
        borderColor: colors.border,
        height: 34,
    },
    filterLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },

    // List
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: SCREEN_PADDING_BOTTOM, paddingTop: 4 },

    // States
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    errorText: { color: colors.error, fontSize: 14 },
    retryBtn: { backgroundColor: colors.bgCard, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    retryText: { color: colors.primary, fontWeight: '700' },

    empty: { alignItems: 'center', paddingTop: 60, gap: spacing.sm },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    emptyBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', maxWidth: 260 },
    addBtnLarge: {
        backgroundColor: colors.primary, borderRadius: radius.full,
        paddingHorizontal: spacing.xl, paddingVertical: 12, marginTop: spacing.sm,
    },
    addBtnLargeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
