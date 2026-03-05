import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Experience } from '../types/database';
import { colors, radius, spacing, typography, TYPE_META } from '../theme';
import { getCompanyLogoUrl } from '../utils/companyLogos';

interface ExperienceCardProps {
    experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
    const router = useRouter();
    const meta = TYPE_META[experience.type] ?? TYPE_META.work;
    const dateRange = formatDateRange(experience.start_date, experience.end_date, experience.is_current);
    const logoUrl = getCompanyLogoUrl(experience.organization);
    const [logoFailed, setLogoFailed] = useState(false);

    const showLogo = logoUrl && !logoFailed;
    const orgInitial = experience.organization?.charAt(0).toUpperCase() ?? '?';

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/experience/${experience.id}`)}
        >
            {/* Left accent stripe */}
            <View style={[styles.accentStripe, { backgroundColor: meta.color }]} />

            <View style={styles.cardContent}>
                {/* Top: type badge */}
                <View style={[styles.badge, { backgroundColor: meta.color + '20' }]}>
                    <Ionicons name={meta.iconName as any} size={11} color={meta.color} />
                    <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>

                {/* Main row: logo + info */}
                <View style={styles.mainRow}>
                    {/* Company logo or fallback */}
                    <View style={[styles.logoWrap, { borderColor: meta.color + '40' }]}>
                        {showLogo ? (
                            <Image
                                source={{ uri: logoUrl }}
                                style={styles.logoImg}
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <Text style={[styles.logoFallback, { color: meta.color }]}>{orgInitial}</Text>
                        )}
                    </View>

                    {/* Info */}
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={2}>{experience.title}</Text>
                        {experience.organization ? (
                            <Text style={styles.org} numberOfLines={1}>{experience.organization}</Text>
                        ) : null}
                        <View style={styles.metaRow}>
                            {experience.location ? (
                                <View style={styles.metaItem}>
                                    <Ionicons name="location" size={11} color={colors.textMuted} />
                                    <Text style={styles.metaText}>{experience.location}</Text>
                                </View>
                            ) : null}
                            {dateRange ? (
                                <View style={styles.metaItem}>
                                    <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
                                    <Text style={styles.metaText}>{dateRange}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                </View>

                {/* Skills chips */}
                {experience.skills.length > 0 && (
                    <View style={styles.chips}>
                        {experience.skills.slice(0, 4).map((skill) => (
                            <View key={skill} style={styles.chip}>
                                <Text style={styles.chipText}>{skill}</Text>
                            </View>
                        ))}
                        {experience.skills.length > 4 && (
                            <View style={styles.chip}>
                                <Text style={styles.chipText}>+{experience.skills.length - 4}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </Pressable>
    );
}

// ─── Date helper ─────────────────────────────────────────────────────────────

function formatDateRange(start: string | null, end: string | null, isCurrent: boolean): string | null {
    const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
    if (!start) return null;
    const endStr = isCurrent ? 'Presente' : end ? fmt(end) : '—';
    return `${fmt(start)} – ${endStr}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    cardPressed: { opacity: 0.75 },

    accentStripe: {
        width: 4,
        borderTopLeftRadius: radius.lg,
        borderBottomLeftRadius: radius.lg,
    },

    cardContent: {
        flex: 1,
        padding: spacing.md,
        gap: 8,
    },

    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: radius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 4,
    },
    badgeText: { fontSize: 10, fontWeight: '700' },

    // Main row: logo + info
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    // Logo circle
    logoWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.bgCardAlt,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
    },
    logoImg: {
        width: 44,
        height: 44,
        borderRadius: 12,
    },
    logoFallback: {
        fontSize: 20,
        fontWeight: '800',
    },

    info: { flex: 1, gap: 2 },
    title: { ...typography.bodyBold, fontSize: 15, lineHeight: 20 },
    org: { fontSize: 13, color: colors.textSecondary },
    metaRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: 2 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    metaText: { fontSize: 11, color: colors.textMuted },

    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: {
        backgroundColor: colors.bg,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipText: { fontSize: 11, color: colors.textMuted },
});
