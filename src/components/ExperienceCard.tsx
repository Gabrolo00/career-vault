import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Experience } from '../types/database';
import { colors, radius, spacing, typography, TYPE_META } from '../theme';

interface ExperienceCardProps {
    experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
    const router = useRouter();
    const meta = TYPE_META[experience.type] ?? TYPE_META.work;

    const dateRange = formatDateRange(experience.start_date, experience.end_date, experience.is_current);

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/experience/${experience.id}`)}
        >
            {/* Type badge */}
            <View style={[styles.badge, { backgroundColor: meta.color + '22' }]}>
                <Text style={styles.badgeEmoji}>{meta.emoji}</Text>
                <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
            </View>

            {/* Title + org */}
            <Text style={styles.title} numberOfLines={2}>{experience.title}</Text>
            {experience.organization ? (
                <Text style={styles.org} numberOfLines={1}>{experience.organization}</Text>
            ) : null}

            {/* Date row */}
            <View style={styles.metaRow}>
                {experience.location ? (
                    <Text style={styles.metaText}>📍 {experience.location}</Text>
                ) : null}
                {dateRange ? (
                    <Text style={styles.metaText}>🗓 {dateRange}</Text>
                ) : null}
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
        </Pressable>
    );
}

// ─── Date helper ─────────────────────────────────────────────────────────────

function formatDateRange(
    start: string | null,
    end: string | null,
    isCurrent: boolean
): string | null {
    const fmt = (d: string) =>
        new Date(d).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
    if (!start) return null;
    const endStr = isCurrent ? 'Presente' : end ? fmt(end) : '—';
    return `${fmt(start)} – ${endStr}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.xs,
    },
    cardPressed: { opacity: 0.75 },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        gap: 4,
        marginBottom: 2,
    },
    badgeEmoji: { fontSize: 12 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    title: { ...typography.bodyBold, lineHeight: 22 },
    org: { ...typography.body, fontSize: 14 },
    metaRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap', marginTop: 2 },
    metaText: { ...typography.caption, fontSize: 13 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 4 },
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
