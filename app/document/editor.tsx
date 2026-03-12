import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    BackHandler,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDocumentById, updateDocument } from '../../src/services/documentService';
import {
    N8nExperienceItem,
    N8nGenerationResult,
    N8nLanguageItem,
    N8nProjectItem,
} from '../../src/types/generation';
import { TemplateId } from '../(tabs)/generate';
import { colors, radius, spacing, typography } from '../../src/theme';
import { DatePickerField } from '../../src/components/DatePickerField';

// ─── Period helpers ───────────────────────────────────────────────────────────

const IT_MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const IT_MONTH_MAP: Record<string, number> = {
    gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
    lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11,
};

function formatDateIT(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return `${IT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildPeriod(start: string, end: string, isCurrent: boolean): string {
    const s = formatDateIT(start);
    const e = isCurrent ? 'Presente' : formatDateIT(end);
    if (s && e) return `${s} – ${e}`;
    if (s) return s;
    if (e) return e;
    return '';
}

/** Best-effort parse of "Gen 2022 – Presente" or "Gen 2022 – Mar 2024" */
function parsePeriod(period: string): { start: string; end: string; isCurrent: boolean } {
    const sep = period.includes('–') ? '–' : '–';
    const [rawStart = '', rawEnd = ''] = period.split(sep).map(p => p.trim());

    const parseDate = (s: string): string => {
        const parts = s.toLowerCase().split(' ');
        if (parts.length === 2) {
            const month = IT_MONTH_MAP[parts[0]];
            const year = parseInt(parts[1], 10);
            if (month !== undefined && !isNaN(year))
                return `${year}-${String(month + 1).padStart(2, '0')}-01`;
        }
        if (parts.length === 1) {
            const year = parseInt(parts[0], 10);
            if (!isNaN(year)) return `${year}-01-01`;
        }
        return '';
    };

    const isCurrent = /present|attual|corrente|ongoing/i.test(rawEnd);
    return {
        start: parseDate(rawStart),
        end: isCurrent ? '' : parseDate(rawEnd),
        isCurrent,
    };
}

// ─── Section types ────────────────────────────────────────────────────────────

type SectionKey =
    | 'profile_summary'
    | 'experiences'
    | 'projects'
    | 'education'
    | 'certifications'
    | 'skills'
    | 'languages';

const ALL_SECTIONS: SectionKey[] = [
    'profile_summary',
    'experiences',
    'projects',
    'education',
    'certifications',
    'skills',
    'languages',
];

const SECTION_META: Record<SectionKey, { label: string; icon: string; color: string }> = {
    profile_summary: { label: 'Profilo', icon: 'person-outline', color: colors.primary },
    experiences: { label: 'Esperienze', icon: 'briefcase-outline', color: colors.work },
    projects: { label: 'Progetti', icon: 'rocket-outline', color: colors.project },
    education: { label: 'Istruzione', icon: 'school-outline', color: colors.education },
    certifications: { label: 'Certificazioni', icon: 'ribbon-outline', color: colors.certification },
    skills: { label: 'Competenze', icon: 'flash-outline', color: colors.secondary },
    languages: { label: 'Lingue', icon: 'language-outline', color: colors.language_cert },
};

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'creative', label: 'Creative' },
];

// ─── Empty item factories ─────────────────────────────────────────────────────

function emptyExperienceItem(): N8nExperienceItem {
    return { title: '', organization: '', period: '', description: '', skills: [] };
}

function emptyProjectItem(): N8nProjectItem {
    return { title: '', organization: '', period: '', description: '', skills: [] };
}

function emptyLanguageItem(): N8nLanguageItem {
    return { name: '', level: '', proficiency: 0 };
}

// ─── Helper: check if a section has data ─────────────────────────────────────

function sectionHasData(content: N8nGenerationResult, key: SectionKey): boolean {
    switch (key) {
        case 'profile_summary': return !!content.profile_summary?.trim();
        case 'experiences': return content.experiences?.length > 0;
        case 'projects': return content.projects?.length > 0;
        case 'education': return content.education?.length > 0;
        case 'certifications': return content.certifications?.length > 0;
        case 'skills': return content.skills?.length > 0;
        case 'languages': return content.languages?.length > 0;
    }
}

// ─── FieldInput component ─────────────────────────────────────────────────────

interface FieldInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric';
    placeholder?: string;
}

function FieldInput({ label, value, onChangeText, multiline, keyboardType, placeholder }: FieldInputProps) {
    return (
        <View style={fieldStyles.wrapper}>
            <Text style={fieldStyles.label}>{label}</Text>
            <TextInput
                style={[fieldStyles.input, multiline && fieldStyles.inputMultiline]}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                keyboardType={keyboardType ?? 'default'}
                placeholder={placeholder ?? ''}
                placeholderTextColor={colors.textPlaceholder}
            />
        </View>
    );
}

const fieldStyles = StyleSheet.create({
    wrapper: { marginBottom: spacing.sm },
    label: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    input: {
        backgroundColor: colors.bgInput,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: Platform.OS === 'ios' ? spacing.sm : 6,
        fontSize: 14,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: spacing.sm,
    },
});

// ─── ExperienceItemCard ───────────────────────────────────────────────────────

interface ExperienceItemCardProps {
    item: N8nExperienceItem | N8nProjectItem;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onChange: (field: string, value: string) => void;
}

function ExperienceItemCard({ item, index, isExpanded, onToggle, onDelete, onChange }: ExperienceItemCardProps) {
    // Local date state — initialised once from the period string
    const parsed = React.useMemo(() => parsePeriod(item.period ?? ''), []);
    const [startDate, setStartDate] = useState(parsed.start);
    const [endDate, setEndDate] = useState(parsed.end);
    const [isCurrent, setIsCurrent] = useState(parsed.isCurrent);

    const handleStartChange = (date: string) => {
        setStartDate(date);
        onChange('period', buildPeriod(date, endDate, isCurrent));
    };
    const handleEndChange = (date: string) => {
        setEndDate(date);
        onChange('period', buildPeriod(startDate, date, isCurrent));
    };
    const handleCurrentToggle = () => {
        const next = !isCurrent;
        setIsCurrent(next);
        onChange('period', buildPeriod(startDate, endDate, next));
    };

    return (
        <View style={itemStyles.card}>
            <Pressable onPress={onToggle} style={itemStyles.header}>
                <Text style={itemStyles.title} numberOfLines={1}>
                    {item.title || '(Senza titolo)'}
                </Text>
                <View style={itemStyles.actions}>
                    <Pressable onPress={onDelete} hitSlop={8} style={itemStyles.iconBtn}>
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </Pressable>
                    <Ionicons
                        name={isExpanded ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
                        size={20}
                        color={colors.primary}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <View style={itemStyles.body}>
                    <FieldInput label="Titolo" value={item.title} onChangeText={v => onChange('title', v)} />
                    <FieldInput label="Organizzazione" value={item.organization} onChangeText={v => onChange('organization', v)} />

                    {/* Period — two date pickers + "Attualmente" toggle */}
                    <View style={itemStyles.periodRow}>
                        <View style={itemStyles.periodField}>
                            <DatePickerField label="Inizio" value={startDate} onChange={handleStartChange} />
                        </View>
                        <View style={itemStyles.periodField}>
                            <DatePickerField label="Fine" value={endDate} onChange={handleEndChange} disabled={isCurrent} />
                        </View>
                    </View>
                    <Pressable onPress={handleCurrentToggle} style={itemStyles.currentRow}>
                        <View style={[itemStyles.checkbox, isCurrent && itemStyles.checkboxActive]}>
                            {isCurrent && <Ionicons name="checkmark" size={12} color="#fff" />}
                        </View>
                        <Text style={itemStyles.currentLabel}>Attualmente in corso</Text>
                    </Pressable>

                    <FieldInput label="Descrizione" value={item.description} onChangeText={v => onChange('description', v)} multiline />
                    <FieldInput
                        label="Competenze (separate da virgola)"
                        value={(item.skills ?? []).join(', ')}
                        onChangeText={v => onChange('skills', v)}
                        placeholder="React, TypeScript, Node.js"
                    />
                </View>
            )}
        </View>
    );
}

const itemStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCardAlt,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    title: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginRight: spacing.sm },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconBtn: { padding: 4 },
    body: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.md,
    },
    periodRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    periodField: { flex: 1 },
    currentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    checkbox: {
        width: 20, height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    currentLabel: { fontSize: 13, color: colors.textSecondary },
});

// ─── LanguageItemCard ─────────────────────────────────────────────────────────

interface LanguageItemCardProps {
    item: N8nLanguageItem;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
    onChange: (field: string, value: string) => void;
}

function LanguageItemCard({ item, isExpanded, onToggle, onDelete, onChange }: LanguageItemCardProps) {
    return (
        <View style={itemStyles.card}>
            <Pressable onPress={onToggle} style={itemStyles.header}>
                <Text style={itemStyles.title} numberOfLines={1}>
                    {item.name || '(Senza nome)'}
                </Text>
                <View style={itemStyles.actions}>
                    <Pressable onPress={onDelete} hitSlop={8} style={itemStyles.iconBtn}>
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </Pressable>
                    <Ionicons
                        name={isExpanded ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
                        size={20}
                        color={colors.primary}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <View style={itemStyles.body}>
                    <FieldInput label="Lingua" value={item.name} onChangeText={v => onChange('name', v)} />
                    <FieldInput label="Livello (es. C1, B2, Madrelingua)" value={item.level} onChangeText={v => onChange('level', v)} />
                    <FieldInput
                        label="Competenza (0–100)"
                        value={String(item.proficiency)}
                        onChangeText={v => onChange('proficiency', v)}
                        keyboardType="numeric"
                    />
                </View>
            )}
        </View>
    );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
    sectionKey: SectionKey;
    content: N8nGenerationResult;
    index: number;
    total: number;
    isExpanded: boolean;
    expandedItemIdx: number | null;
    onToggle: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
    onSetExpandedItemIdx: (idx: number | null) => void;
    onUpdateContent: (updater: (prev: N8nGenerationResult) => N8nGenerationResult) => void;
}

function SectionCard({
    sectionKey,
    content,
    index,
    total,
    isExpanded,
    expandedItemIdx,
    onToggle,
    onMoveUp,
    onMoveDown,
    onRemove,
    onSetExpandedItemIdx,
    onUpdateContent,
}: SectionCardProps) {
    const meta = SECTION_META[sectionKey];

    const handleDelete = () => {
        Alert.alert(
            'Rimuovi sezione',
            `Vuoi rimuovere la sezione "${meta.label}" dal documento?`,
            [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Rimuovi', style: 'destructive', onPress: onRemove },
            ]
        );
    };

    // ── Update helpers ────────────────────────────────────────────────────────

    const updateListItem = (
        listKey: 'experiences' | 'projects' | 'education' | 'certifications',
        idx: number,
        field: string,
        value: string
    ) => {
        onUpdateContent(prev => {
            const list = [...(prev[listKey] as (N8nExperienceItem | N8nProjectItem)[])];
            const item = { ...list[idx] } as Record<string, unknown>;
            if (field === 'skills') {
                item[field] = value.split(',').map(s => s.trim()).filter(Boolean);
            } else {
                item[field] = value;
            }
            list[idx] = item as N8nExperienceItem & N8nProjectItem;
            return { ...prev, [listKey]: list };
        });
    };

    const updateLanguageItem = (idx: number, field: string, value: string) => {
        onUpdateContent(prev => {
            const list = [...prev.languages];
            const item = { ...list[idx] };
            if (field === 'proficiency') {
                item.proficiency = parseInt(value, 10) || 0;
            } else {
                (item as Record<string, unknown>)[field] = value;
            }
            list[idx] = item;
            return { ...prev, languages: list };
        });
    };

    const addListItem = (
        listKey: 'experiences' | 'projects' | 'education' | 'certifications'
    ) => {
        onUpdateContent(prev => {
            const list = [...(prev[listKey] as (N8nExperienceItem | N8nProjectItem)[])];
            if (listKey === 'projects') {
                list.push(emptyProjectItem());
            } else {
                list.push(emptyExperienceItem());
            }
            onSetExpandedItemIdx(list.length - 1);
            return { ...prev, [listKey]: list };
        });
    };

    const removeListItem = (
        listKey: 'experiences' | 'projects' | 'education' | 'certifications',
        idx: number
    ) => {
        onUpdateContent(prev => {
            const list = [...(prev[listKey] as (N8nExperienceItem | N8nProjectItem)[])];
            list.splice(idx, 1);
            return { ...prev, [listKey]: list };
        });
        if (expandedItemIdx === idx) onSetExpandedItemIdx(null);
    };

    const addLanguage = () => {
        onUpdateContent(prev => {
            const list = [...prev.languages, emptyLanguageItem()];
            onSetExpandedItemIdx(list.length - 1);
            return { ...prev, languages: list };
        });
    };

    const removeLanguage = (idx: number) => {
        onUpdateContent(prev => {
            const list = [...prev.languages];
            list.splice(idx, 1);
            return { ...prev, languages: list };
        });
        if (expandedItemIdx === idx) onSetExpandedItemIdx(null);
    };

    // ── Body renderer ─────────────────────────────────────────────────────────

    const renderBody = () => {
        switch (sectionKey) {
            case 'profile_summary':
                return (
                    <View style={sectionStyles.body}>
                        <FieldInput
                            label="Sommario"
                            value={content.profile_summary}
                            onChangeText={v =>
                                onUpdateContent(prev => ({ ...prev, profile_summary: v }))
                            }
                            multiline
                        />
                    </View>
                );

            case 'skills':
                return (
                    <View style={sectionStyles.body}>
                        <FieldInput
                            label="Competenze (separate da virgola)"
                            value={(content.skills ?? []).join(', ')}
                            onChangeText={v =>
                                onUpdateContent(prev => ({
                                    ...prev,
                                    skills: v.split(',').map(s => s.trim()).filter(Boolean),
                                }))
                            }
                            placeholder="React, TypeScript, Node.js"
                        />
                    </View>
                );

            case 'experiences':
            case 'projects':
            case 'education':
            case 'certifications': {
                const listKey = sectionKey as 'experiences' | 'projects' | 'education' | 'certifications';
                const items = ((content[listKey] ?? []) as (N8nExperienceItem | N8nProjectItem)[]);
                return (
                    <View style={sectionStyles.body}>
                        {items.map((item, idx) => (
                            <ExperienceItemCard
                                key={idx}
                                item={item}
                                index={idx}
                                isExpanded={expandedItemIdx === idx}
                                onToggle={() => onSetExpandedItemIdx(expandedItemIdx === idx ? null : idx)}
                                onDelete={() => removeListItem(listKey, idx)}
                                onChange={(field, value) => updateListItem(listKey, idx, field, value)}
                            />
                        ))}
                        <Pressable style={sectionStyles.addBtn} onPress={() => addListItem(listKey)}>
                            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                            <Text style={sectionStyles.addBtnText}>Aggiungi voce</Text>
                        </Pressable>
                    </View>
                );
            }

            case 'languages':
                return (
                    <View style={sectionStyles.body}>
                        {(content.languages ?? []).map((lang, idx) => (
                            <LanguageItemCard
                                key={idx}
                                item={lang}
                                index={idx}
                                isExpanded={expandedItemIdx === idx}
                                onToggle={() => onSetExpandedItemIdx(expandedItemIdx === idx ? null : idx)}
                                onDelete={() => removeLanguage(idx)}
                                onChange={(field, value) => updateLanguageItem(idx, field, value)}
                            />
                        ))}
                        <Pressable style={sectionStyles.addBtn} onPress={addLanguage}>
                            <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                            <Text style={sectionStyles.addBtnText}>Aggiungi lingua</Text>
                        </Pressable>
                    </View>
                );
        }
    };

    return (
        <View style={sectionStyles.card}>
            {/* Header */}
            <View style={sectionStyles.header}>
                <View style={sectionStyles.headerLeft}>
                    <Ionicons name={meta.icon as any} size={18} color={meta.color} />
                    <Text style={[sectionStyles.headerLabel, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <View style={sectionStyles.headerActions}>
                    <Pressable
                        onPress={onMoveUp}
                        disabled={index === 0}
                        hitSlop={8}
                        style={sectionStyles.iconBtn}
                    >
                        <Ionicons
                            name="chevron-up"
                            size={16}
                            color={index === 0 ? colors.textMuted : colors.textSecondary}
                        />
                    </Pressable>
                    <Pressable
                        onPress={onMoveDown}
                        disabled={index === total - 1}
                        hitSlop={8}
                        style={sectionStyles.iconBtn}
                    >
                        <Ionicons
                            name="chevron-down"
                            size={16}
                            color={index === total - 1 ? colors.textMuted : colors.textSecondary}
                        />
                    </Pressable>
                    <Pressable onPress={handleDelete} hitSlop={8} style={sectionStyles.iconBtn}>
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </Pressable>
                    <Pressable onPress={onToggle} hitSlop={8} style={sectionStyles.iconBtn}>
                        <Ionicons
                            name={isExpanded ? 'chevron-up-circle-outline' : 'chevron-down-circle-outline'}
                            size={20}
                            color={colors.primary}
                        />
                    </Pressable>
                </View>
            </View>

            {/* Body */}
            {isExpanded && renderBody()}
        </View>
    );
}

const sectionStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    headerLabel: { fontSize: 15, fontWeight: '700' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    iconBtn: { padding: 4 },
    body: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.md,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xs,
        paddingVertical: spacing.sm,
    },
    addBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});

// ─── AddSectionCard ───────────────────────────────────────────────────────────

interface AddSectionCardProps {
    missingSections: SectionKey[];
    onAdd: (key: SectionKey) => void;
}

function AddSectionCard({ missingSections, onAdd }: AddSectionCardProps) {
    return (
        <View style={addStyles.card}>
            <Text style={addStyles.title}>Aggiungi sezione</Text>
            <View style={addStyles.pills}>
                {missingSections.map(key => {
                    const meta = SECTION_META[key];
                    return (
                        <Pressable key={key} style={addStyles.pill} onPress={() => onAdd(key)}>
                            <Ionicons name={meta.icon as any} size={13} color={meta.color} />
                            <Text style={[addStyles.pillText, { color: meta.color }]}>{meta.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

const addStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    title: { ...typography.label, color: colors.textMuted, marginBottom: spacing.sm },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    pillText: { fontSize: 12, fontWeight: '600' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CvEditorScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [content, setContent] = useState<N8nGenerationResult | null>(null);
    const [templateId, setTemplateId] = useState<TemplateId>('modern');
    const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(ALL_SECTIONS);
    const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
    const [expandedItemIdx, setExpandedItemIdx] = useState<number | null>(null);
    const [dirty, setDirty] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Keep a stable ref to dirty for BackHandler callback
    const dirtyRef = useRef(dirty);
    dirtyRef.current = dirty;

    // ── Load ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const doc = await getDocumentById(id);
                const result = doc.generated_content as unknown as N8nGenerationResult;
                setContent(result);
                setTemplateId((doc.template_id ?? 'modern') as TemplateId);

                // Determine initial section order: only sections with data
                const withData = ALL_SECTIONS.filter(k => sectionHasData(result, k));
                setSectionOrder(withData.length > 0 ? withData : ALL_SECTIONS);
            } catch (e) {
                Alert.alert('Errore', (e as Error).message);
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ── Back handler ──────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        if (dirtyRef.current) {
            Alert.alert(
                'Modifiche non salvate',
                'Hai modifiche non salvate. Vuoi uscire senza salvare?',
                [
                    { text: 'Rimani', style: 'cancel' },
                    { text: 'Esci', style: 'destructive', onPress: () => router.back() },
                ]
            );
            return true; // consumed (Android)
        }
        router.back();
        return true;
    }, [router]);

    useEffect(() => {
        if (Platform.OS !== 'android') return;
        const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
        return () => sub.remove();
    }, [handleBack]);

    // ── Save ──────────────────────────────────────────────────────────────────

    const handleSave = useCallback(async () => {
        if (!content || !id) return;
        try {
            setSaving(true);
            await updateDocument(id, {
                generated_content: content as any,
                template_id: templateId,
            });
            setDirty(false);
            Alert.alert('Salvato', 'Modifiche salvate con successo.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e) {
            Alert.alert('Errore salvataggio', (e as Error).message);
        } finally {
            setSaving(false);
        }
    }, [content, id, templateId, router]);

    // ── Content updater ───────────────────────────────────────────────────────

    const updateContent = useCallback((updater: (prev: N8nGenerationResult) => N8nGenerationResult) => {
        setContent(prev => {
            if (!prev) return prev;
            return updater(prev);
        });
        setDirty(true);
    }, []);

    // ── Section management ────────────────────────────────────────────────────

    const moveSection = useCallback((key: SectionKey, direction: 'up' | 'down') => {
        setSectionOrder(prev => {
            const idx = prev.indexOf(key);
            if (idx === -1) return prev;
            const next = [...prev];
            const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= next.length) return prev;
            [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
            return next;
        });
        setDirty(true);
    }, []);

    const removeSection = useCallback((key: SectionKey) => {
        setSectionOrder(prev => prev.filter(k => k !== key));
        if (expandedSection === key) setExpandedSection(null);
        setDirty(true);
    }, [expandedSection]);

    const addSection = useCallback((key: SectionKey) => {
        setSectionOrder(prev => [...prev, key]);
        setDirty(true);
    }, []);

    const handleSectionToggle = useCallback((key: SectionKey) => {
        setExpandedSection(prev => (prev === key ? null : key));
        setExpandedItemIdx(null);
    }, []);

    const handleSetExpandedItemIdx = useCallback((idx: number | null) => {
        setExpandedItemIdx(idx);
    }, []);

    // ── Template change ───────────────────────────────────────────────────────

    const handleTemplateChange = useCallback((t: TemplateId) => {
        setTemplateId(t);
        setDirty(true);
    }, []);

    // ── Missing sections ──────────────────────────────────────────────────────

    const missingSections = ALL_SECTIONS.filter(k => !sectionOrder.includes(k));

    // ── Loading state ─────────────────────────────────────────────────────────

    if (loading || !content) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Caricamento editor…</Text>
            </View>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <Pressable onPress={handleBack} style={styles.topBarBack}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                    <Text style={styles.topBarBackText}>Indietro</Text>
                </Pressable>
                <Text style={styles.topBarTitle}>CV Editor</Text>
                <Pressable
                    onPress={handleSave}
                    disabled={!dirty || saving}
                    style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
                >
                    <Text style={styles.saveBtnText}>{saving ? 'Salvataggio…' : 'Salva'}</Text>
                </Pressable>
            </View>

            {/* Template Switcher */}
            <View style={styles.templateRow}>
                <Text style={styles.templateLabel}>Template:</Text>
                <View style={styles.templatePills}>
                    {TEMPLATE_OPTIONS.map(opt => (
                        <Pressable
                            key={opt.id}
                            onPress={() => handleTemplateChange(opt.id)}
                            style={[
                                styles.templatePill,
                                templateId === opt.id
                                    ? styles.templatePillActive
                                    : styles.templatePillInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.templatePillText,
                                    templateId === opt.id
                                        ? styles.templatePillTextActive
                                        : styles.templatePillTextInactive,
                                ]}
                            >
                                {opt.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Sections */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {sectionOrder.map((key, idx) => (
                    <SectionCard
                        key={key}
                        sectionKey={key}
                        content={content}
                        index={idx}
                        total={sectionOrder.length}
                        isExpanded={expandedSection === key}
                        expandedItemIdx={expandedSection === key ? expandedItemIdx : null}
                        onToggle={() => handleSectionToggle(key)}
                        onMoveUp={() => moveSection(key, 'up')}
                        onMoveDown={() => moveSection(key, 'down')}
                        onRemove={() => removeSection(key)}
                        onSetExpandedItemIdx={handleSetExpandedItemIdx}
                        onUpdateContent={updateContent}
                    />
                ))}

                {missingSections.length > 0 && (
                    <AddSectionCard missingSections={missingSections} onAdd={addSection} />
                )}
            </ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    loadingContainer: {
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: { ...typography.body, color: colors.textMuted },

    // Top bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingTop: Platform.OS === 'ios' ? 52 : 40,
        paddingBottom: spacing.sm,
    },
    topBarBack: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 80 },
    topBarBackText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    topBarTitle: { ...typography.h3, fontSize: 17 },
    saveBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // Template switcher
    templateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    templateLabel: { ...typography.label, color: colors.textMuted, fontSize: 13 },
    templatePills: { flexDirection: 'row', gap: spacing.sm },
    templatePill: {
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderWidth: 1,
    },
    templatePillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    templatePillInactive: {
        backgroundColor: 'transparent',
        borderColor: colors.border,
    },
    templatePillText: { fontSize: 13, fontWeight: '600' },
    templatePillTextActive: { color: '#fff' },
    templatePillTextInactive: { color: colors.textSecondary },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: spacing.md, paddingBottom: 60 },
});
