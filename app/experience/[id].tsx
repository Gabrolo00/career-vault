import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getExperienceById } from '../../src/services/experienceService';
import { useExperiences } from '../../src/hooks/useExperiences';
import { Experience, ExperienceType } from '../../src/types/database';
import { colors, radius, spacing, TYPE_META, typography } from '../../src/theme';

// ─── Schema (same as new.tsx but reused here) ─────────────────────────────────

const schema = z.object({
    type: z.enum(['work', 'education', 'project', 'certification', 'volunteer']),
    title: z.string().min(2, 'Il titolo è obbligatorio'),
    organization: z.string().optional(),
    location: z.string().optional(),
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD')
        .optional()
        .or(z.literal('')),
    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD')
        .optional()
        .or(z.literal('')),
    is_current: z.boolean(),
    description: z.string().optional(),
    skills: z.string(),
    tags: z.string(),
});

type FormValues = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ExperienceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { update, remove } = useExperiences();

    const [exp, setExp] = useState<Experience | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const isCurrent = watch('is_current');
    const selectedType = watch('type');

    // Load experience on mount
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await getExperienceById(id);
                setExp(data);
                reset({
                    type: data.type,
                    title: data.title,
                    organization: data.organization ?? '',
                    location: data.location ?? '',
                    start_date: data.start_date ?? '',
                    end_date: data.end_date ?? '',
                    is_current: data.is_current,
                    description: data.description ?? '',
                    skills: data.skills.join(', '),
                    tags: data.tags.join(', '),
                });
            } catch (e) {
                setFetchError((e as Error).message);
            } finally {
                setFetchLoading(false);
            }
        })();
    }, [id]);

    const onSave = async (values: FormValues) => {
        if (!id) return;
        try {
            const updated = await update(id, {
                type: values.type,
                title: values.title,
                organization: values.organization || null,
                location: values.location || null,
                start_date: values.start_date || null,
                end_date: values.is_current ? null : values.end_date || null,
                is_current: values.is_current,
                description: values.description || null,
                skills: values.skills
                    ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
                tags: values.tags
                    ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
            });
            setExp(updated);
            setIsEditMode(false);
        } catch (e) {
            console.error(e);
        }
    };

    const onDelete = () => {
        Alert.alert(
            'Elimina esperienza',
            'Sei sicuro? Questa azione non può essere annullata.',
            [
                { text: 'Annulla', style: 'cancel' },
                {
                    text: 'Elimina',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await remove(id!);
                            router.back();
                        } catch (e) {
                            console.error(e);
                        }
                    },
                },
            ]
        );
    };

    // ── Loading / error states ──────────────────────────────────────────────────

    if (fetchLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    if (fetchError || !exp) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>⚠️ {fetchError ?? 'Esperienza non trovata'}</Text>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backBtnText}>← Torna indietro</Text>
                </Pressable>
            </View>
        );
    }

    const meta = TYPE_META[exp.type];

    // ── View mode ───────────────────────────────────────────────────────────────

    if (!isEditMode) {
        return (
            <View style={styles.flex}>
                {/* Navbar */}
                <View style={styles.navbar}>
                    <Pressable onPress={() => router.back()} style={styles.navSide}>
                        <Text style={styles.navBackText}>← Indietro</Text>
                    </Pressable>
                    <Text style={styles.navTitle} numberOfLines={1}>Dettaglio</Text>
                    <Pressable onPress={() => setIsEditMode(true)} style={styles.navSide}>
                        <Text style={styles.editBtnText}>✏️ Modifica</Text>
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.viewContainer}>
                    {/* Type badge */}
                    <View style={[styles.badge, { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}>
                        <Text style={styles.badgeEmoji}>{meta.emoji}</Text>
                        <Text style={[styles.badgeLabel, { color: meta.color }]}>{meta.label}</Text>
                    </View>

                    <Text style={styles.viewTitle}>{exp.title}</Text>
                    {exp.organization && <Text style={styles.viewOrg}>{exp.organization}</Text>}

                    <View style={styles.metaRow}>
                        {exp.location && <Text style={styles.metaText}>📍 {exp.location}</Text>}
                        {exp.start_date && (
                            <Text style={styles.metaText}>
                                🗓 {fmt(exp.start_date)} – {exp.is_current ? 'Presente' : exp.end_date ? fmt(exp.end_date) : '—'}
                            </Text>
                        )}
                        {exp.is_current && (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentText}>● In corso</Text>
                            </View>
                        )}
                    </View>

                    {exp.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Descrizione</Text>
                            <Text style={styles.description}>{exp.description}</Text>
                        </View>
                    )}

                    {exp.skills.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            <View style={styles.chips}>
                                {exp.skills.map((s) => (
                                    <View key={s} style={styles.chip}>
                                        <Text style={styles.chipText}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {exp.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tag</Text>
                            <View style={styles.chips}>
                                {exp.tags.map((t) => (
                                    <View key={t} style={[styles.chip, styles.tagChip]}>
                                        <Text style={[styles.chipText, styles.tagText]}>#{t}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Delete */}
                    <Pressable style={styles.deleteBtn} onPress={onDelete}>
                        <Text style={styles.deleteBtnText}>🗑 Elimina esperienza</Text>
                    </Pressable>
                </ScrollView>
            </View>
        );
    }

    // ── Edit mode ───────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.navbar}>
                <Pressable onPress={() => setIsEditMode(false)} style={styles.navSide}>
                    <Text style={styles.navBackText}>Annulla</Text>
                </Pressable>
                <Text style={styles.navTitle}>Modifica</Text>
                <Pressable
                    style={[styles.saveBtn, (isSubmitting || !isDirty) && { opacity: 0.5 }]}
                    onPress={handleSubmit(onSave)}
                    disabled={isSubmitting || !isDirty}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.saveBtnText}>Salva</Text>
                    )}
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.formContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Type selector */}
                <Text style={styles.fieldLabel}>Tipo</Text>
                <View style={styles.typeGrid}>
                    {(Object.keys(TYPE_META) as ExperienceType[]).map((t) => {
                        const m = TYPE_META[t];
                        const isSel = selectedType === t;
                        return (
                            <Pressable
                                key={t}
                                style={[
                                    styles.typeChip,
                                    isSel && { backgroundColor: m.color + '22', borderColor: m.color },
                                ]}
                                onPress={() => setValue('type', t, { shouldDirty: true })}
                            >
                                <Text>{m.emoji}</Text>
                                <Text style={[styles.typeLabel, isSel && { color: m.color }]}>
                                    {m.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                <EditField label="Titolo *" name="title" control={control} error={errors.title?.message} />
                <EditField label="Azienda / Istituto" name="organization" control={control} />
                <EditField label="Luogo" name="location" control={control} />

                <View style={styles.row}>
                    <EditField label="Data inizio" name="start_date" control={control} placeholder="YYYY-MM-DD" half />
                    <EditField label="Data fine" name="end_date" control={control} placeholder="YYYY-MM-DD" half disabled={isCurrent} />
                </View>

                <View style={styles.toggle}>
                    <Text style={styles.fieldLabel}>In corso</Text>
                    <Controller
                        control={control}
                        name="is_current"
                        render={({ field: { onChange, value } }) => (
                            <Switch
                                value={value}
                                onValueChange={(v) => onChange(v)}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={value ? '#fff' : colors.textMuted}
                            />
                        )}
                    />
                </View>

                <Text style={styles.fieldLabel}>Descrizione</Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value, onBlur } }) => (
                        <TextInput
                            style={[styles.input, styles.textarea]}
                            placeholder="Descrivi ruolo, risultati, impatto…"
                            placeholderTextColor={colors.textPlaceholder}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />

                <EditField label="Skills (virgola)" name="skills" control={control} />
                <EditField label="Tag (virgola)" name="tags" control={control} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(d: string) {
    return new Date(d).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
}

function EditField({
    label, name, control, error, placeholder, half, disabled,
}: {
    label: string; name: any; control: any; error?: string;
    placeholder?: string; half?: boolean; disabled?: boolean;
}) {
    return (
        <View style={[styles.fieldWrap, half && { flex: 1 }]}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                        style={[styles.input, error && styles.inputErr, disabled && styles.inputDisabled]}
                        placeholder={placeholder ?? ''}
                        placeholderTextColor={colors.textPlaceholder}
                        value={disabled ? '' : value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={!disabled}
                    />
                )}
            />
            {error && <Text style={styles.errText}>{error}</Text>}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    errorText: { color: colors.error, fontSize: 15 },
    backBtn: { backgroundColor: colors.bgCard, borderRadius: radius.md, paddingHorizontal: 20, paddingVertical: 10 },
    backBtnText: { color: colors.primary, fontWeight: '700' },

    navbar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 56, paddingBottom: 12, paddingHorizontal: spacing.lg,
        backgroundColor: colors.bg, borderBottomWidth: 1, borderColor: colors.border,
    },
    navSide: { width: 80 },
    navBackText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    navTitle: { ...typography.h3, fontSize: 17, flex: 1, textAlign: 'center' },
    editBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600', textAlign: 'right' },
    saveBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 8, width: 80, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    // View mode
    viewContainer: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
    badgeEmoji: { fontSize: 14 },
    badgeLabel: { fontSize: 12, fontWeight: '700' },
    viewTitle: { ...typography.h2, lineHeight: 30, marginTop: 4 },
    viewOrg: { ...typography.body, color: colors.textSecondary },
    metaRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
    metaText: { fontSize: 13, color: colors.textMuted },
    currentBadge: { backgroundColor: colors.success + '22', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
    currentText: { color: colors.success, fontSize: 12, fontWeight: '700' },
    section: { gap: spacing.xs },
    sectionTitle: { ...typography.label },
    description: { ...typography.body, lineHeight: 24 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    chip: { backgroundColor: colors.bgCard, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: colors.border },
    chipText: { fontSize: 12, color: colors.textSecondary },
    tagChip: { borderColor: colors.primary + '44', backgroundColor: colors.primary + '11' },
    tagText: { color: colors.primaryLight },
    deleteBtn: { backgroundColor: colors.errorBg, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.error + '44', marginTop: spacing.md },
    deleteBtnText: { color: colors.error, fontWeight: '700', fontSize: 15 },

    // Edit mode
    formContainer: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.bgCard, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
    typeLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    fieldWrap: { gap: 6 },
    fieldLabel: { ...typography.label },
    input: { backgroundColor: colors.bgInput, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13, fontSize: 15, color: colors.textPrimary },
    inputErr: { borderColor: colors.error },
    inputDisabled: { opacity: 0.35 },
    textarea: { minHeight: 110 },
    errText: { fontSize: 12, color: colors.error },
    row: { flexDirection: 'row', gap: spacing.sm },
    toggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
});
