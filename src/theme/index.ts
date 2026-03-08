// ─── Palette ─────────────────────────────────────────────────────────────────
export const colors = {
    // Background layers
    bg: '#080D1A',
    bgCard: '#0F1929',
    bgCardAlt: '#162033',
    bgInput: '#0F1929',
    border: '#1E3A5F',
    borderFocus: '#3B82F6',

    // Brand
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    secondary: '#22D3EE',
    secondaryLight: '#67E8F9',

    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
    textPlaceholder: '#334155',

    // Semantic
    success: '#22C55E',
    successBg: '#052E16',
    error: '#EF4444',
    errorBg: '#450A0A',
    warning: '#F59E0B',
    warningBg: '#1C1400',

    // Experience type chips
    work: '#3B82F6',  // electric blue
    education: '#22D3EE',  // cyan
    project: '#8B5CF6',  // violet
    certification: '#F59E0B',  // amber
    volunteer: '#EC4899',  // pink
    language_cert: '#10B981',  // emerald
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
    xl: 20,
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

// Bottom tab floating pill height + bottom offset — used for paddingBottom across screens
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_BOTTOM = 20;
export const SCREEN_PADDING_BOTTOM = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM + 16;

// ─── Experience type helpers ──────────────────────────────────────────────────

export const TYPE_META: Record<string, { label: string; iconName: string; color: string }> = {
    work: { label: 'Lavoro', iconName: 'briefcase', color: colors.work },
    education: { label: 'Istruzione', iconName: 'school', color: colors.education },
    project: { label: 'Progetto', iconName: 'rocket', color: colors.project },
    certification: { label: 'Certificazione', iconName: 'ribbon', color: colors.certification },
    volunteer: { label: 'Volontariato', iconName: 'heart', color: colors.volunteer },
    language_cert: { label: 'Cert. Lingua', iconName: 'language', color: colors.language_cert },
};

// Status icons for documents
export const STATUS_ICONS: Record<string, { label: string; color: string; bgColor: string; iconName: string }> = {
    pending: { label: 'In coda', color: colors.textMuted, bgColor: colors.bgCard, iconName: 'time-outline' },
    processing: { label: 'Elaborando', color: colors.warning, bgColor: colors.warningBg, iconName: 'refresh' },
    completed: { label: 'Completato', color: colors.success, bgColor: colors.successBg, iconName: 'checkmark-circle' },
    failed: { label: 'Errore', color: colors.error, bgColor: colors.errorBg, iconName: 'close-circle' },
};

// Doc type icons
export const DOC_TYPE_ICONS: Record<string, string> = {
    cv: 'document-text',
    cover_letter: 'mail',
};
