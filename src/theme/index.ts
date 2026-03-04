// ─── Palette ─────────────────────────────────────────────────────────────────
export const colors = {
    // Background layers
    bg: '#0F172A',
    bgCard: '#1E293B',
    bgInput: '#1E293B',
    border: '#334155',
    borderFocus: '#6366F1',

    // Brand
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',

    // Text
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    textPlaceholder: '#475569',

    // Semantic
    success: '#22C55E',
    successBg: '#052E16',
    error: '#EF4444',
    errorBg: '#450A0A',
    warning: '#F59E0B',
    warningBg: '#1C1400',

    // Experience type chips
    work: '#6366F1',
    education: '#0EA5E9',
    project: '#10B981',
    certification: '#F59E0B',
    volunteer: '#EC4899',
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    full: 999,
} as const;

export const typography = {
    h1: { fontSize: 28, fontWeight: '800' as const, color: colors.textPrimary },
    h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
    h3: { fontSize: 18, fontWeight: '700' as const, color: colors.textPrimary },
    body: { fontSize: 16, fontWeight: '400' as const, color: colors.textSecondary },
    bodyBold: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
    caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textMuted },
    label: { fontSize: 14, fontWeight: '600' as const, color: colors.textSecondary },
} as const;

// ─── Experience type helpers ──────────────────────────────────────────────────

export const TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
    work: { label: 'Lavoro', emoji: '💼', color: colors.work },
    education: { label: 'Istruzione', emoji: '🎓', color: colors.education },
    project: { label: 'Progetto', emoji: '🚀', color: colors.project },
    certification: { label: 'Certificazione', emoji: '🏆', color: colors.certification },
    volunteer: { label: 'Volontariato', emoji: '🤝', color: colors.volunteer },
};
