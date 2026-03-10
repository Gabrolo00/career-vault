import React from 'react';
import {
    ActivityIndicator,
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
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExperiences } from '../../src/hooks/useExperiences';
import { DatePickerField } from '../../src/components/DatePickerField';
import { colors, radius, spacing, TYPE_META, typography } from '../../src/theme';
import { ExperienceType } from '../../src/types/database';

// ─── CEFR ─────────────────────────────────────────────────────────────────────

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Madrelingua'] as const;
const CEFR_PROFICIENCY: Record<string, number> = {
    A1: 15, A2: 30, B1: 50, B2: 65, C1: 80, C2: 95, Madrelingua: 100,
};

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    type: z.enum(['work', 'education', 'project', 'certification', 'volunteer', 'language_cert']),
    title: z.string().min(2, 'Il titolo è obbligatorio'),
    organization: z.string().optional(),
    location: z.string().optional(),
    start_date: z.string().optional().or(z.literal('')),
    end_date: z.string().optional().or(z.literal('')),
    is_current: z.boolean(),
    description: z.string().optional(),
    skills: z.string(), // comma-separated, parsed on submit
    cefr_level: z.string().optional(), // used only for language_cert
});

type FormValues = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NewExperienceScreen() {
    const router = useRouter();
    const { add } = useExperiences();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: 'work',
            title: '',
            organization: '',
            location: '',
            start_date: '',
            end_date: '',
            is_current: false,
            description: '',
            skills: '',
            cefr_level: '',
        },
    });

    const isCurrent = watch('is_current');
    const selectedType = watch('type');
    const cefrLevel = watch('cefr_level');
    const isLangCert = selectedType === 'language_cert';

    const onSubmit = async (values: FormValues) => {
        try {
            if (values.type === 'language_cert') {
                await add({
                    type: 'language_cert',
                    title: values.title,
                    organization: values.organization || null,
                    location: null,
                    start_date: values.start_date || null,
                    end_date: null,
                    is_current: false,
                    description: values.description || null,
                    skills: [],
                    metadata: { proficiency: CEFR_PROFICIENCY[values.cefr_level ?? ''] ?? 0, cefr_level: values.cefr_level ?? null },
                });
            } else {
                await add({
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
                    metadata: {},
                });
            }
            router.back();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Nav bar */}
            <View style={styles.navbar}>
                <Pressable onPress={() => router.back()} style={styles.navBack}>
                    <Text style={styles.navBackText}>← Indietro</Text>
                </Pressable>
                <Text style={styles.navTitle}>Nuova esperienza</Text>
                <View style={{ width: 80 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Type selector */}
                <Text style={styles.sectionLabel}>Tipo</Text>
                <View style={styles.typeGrid}>
                    {(Object.keys(TYPE_META) as ExperienceType[]).map((t) => {
                        const meta = TYPE_META[t];
                        const isSelected = selectedType === t;
                        return (
                            <Pressable
                                key={t}
                                style={[
                                    styles.typeChip,
                                    isSelected && {
                                        backgroundColor: meta.color + '22',
                                        borderColor: meta.color,
                                    },
                                ]}
                                onPress={() => setValue('type', t)}
                            >
                                <Text style={styles.typeEmoji}>{meta.emoji}</Text>
                                <Text
                                    style={[
                                        styles.typeLabel,
                                        isSelected && { color: meta.color },
                                    ]}
                                >
                                    {meta.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                {errors.type && <Text style={styles.errText}>{errors.type.message}</Text>}

                {isLangCert ? (
                    // ── Language cert fields ────────────────────────────────────
                    <>
                        <FormField
                            label="Lingua *"
                            placeholder="es. Inglese"
                            control={control}
                            name="title"
                            error={errors.title?.message}
                        />

                        <FormField
                            label="Ente certificatore"
                            placeholder="es. Cambridge, DELF, Goethe-Institut…"
                            control={control}
                            name="organization"
                            error={errors.organization?.message}
                        />

                        <FormField
                            label="Nome certificazione"
                            placeholder="es. Cambridge C1 Advanced"
                            control={control}
                            name="description"
                            error={errors.description?.message}
                        />

                        {/* CEFR level selector */}
                        <View style={styles.fieldWrap}>
                            <Text style={styles.label}>Livello CEFR</Text>
                            <View style={styles.cefrGrid}>
                                {CEFR_LEVELS.map((level) => {
                                    const isSelected = cefrLevel === level;
                                    return (
                                        <Pressable
                                            key={level}
                                            style={[
                                                styles.cefrChip,
                                                isSelected && styles.cefrChipSelected,
                                            ]}
                                            onPress={() => setValue('cefr_level', level)}
                                        >
                                            <Text style={[styles.cefrLabel, isSelected && styles.cefrLabelSelected]}>
                                                {level}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Date obtained */}
                        <Controller
                            control={control}
                            name="start_date"
                            render={({ field: { onChange, value } }) => (
                                <DatePickerField
                                    label="Data conseguimento"
                                    value={value ?? ''}
                                    onChange={onChange}
                                    maxDate={new Date()}
                                />
                            )}
                        />
                    </>
                ) : (
                    // ── Generic experience fields ───────────────────────────────
                    <>
                        <FormField
                            label="Titolo *"
                            placeholder="es. Senior Software Engineer"
                            control={control}
                            name="title"
                            error={errors.title?.message}
                        />

                        <FormField
                            label="Azienda / Istituto"
                            placeholder="es. Google"
                            control={control}
                            name="organization"
                            error={errors.organization?.message}
                        />

                        <FormField
                            label="Luogo"
                            placeholder="es. Milano, IT (o Remoto)"
                            control={control}
                            name="location"
                            error={errors.location?.message}
                        />

                        {/* Dates row */}
                        <View style={styles.row}>
                            <View style={styles.halfField}>
                                <Controller
                                    control={control}
                                    name="start_date"
                                    render={({ field: { onChange, value } }) => (
                                        <DatePickerField
                                            label="Data inizio"
                                            value={value ?? ''}
                                            onChange={onChange}
                                            maxDate={new Date()}
                                        />
                                    )}
                                />
                            </View>
                            <View style={styles.halfField}>
                                <Controller
                                    control={control}
                                    name="end_date"
                                    render={({ field: { onChange, value } }) => (
                                        <DatePickerField
                                            label="Data fine"
                                            value={isCurrent ? '' : (value ?? '')}
                                            onChange={onChange}
                                            disabled={isCurrent}
                                            maxDate={new Date()}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        {/* Is current toggle */}
                        <View style={styles.toggle}>
                            <Text style={styles.label}>Esperienza in corso</Text>
                            <Controller
                                control={control}
                                name="is_current"
                                render={({ field: { onChange, value } }) => (
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                        trackColor={{ false: colors.border, true: colors.primary }}
                                        thumbColor={value ? '#fff' : colors.textMuted}
                                    />
                                )}
                            />
                        </View>

                        {/* Description */}
                        <Text style={styles.label}>Descrizione</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, value, onBlur } }) => (
                                <TextInput
                                    style={[styles.input, styles.textarea]}
                                    placeholder="Descrivi attività, responsabilità, risultati…"
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

                        <FormField
                            label="Competenze e Strumenti usati (separati da virgola)"
                            placeholder="es. React Native, TypeScript, Supabase"
                            control={control}
                            name="skills"
                            error={errors.skills?.message}
                        />
                    </>
                )}

                {/* Submit */}
                <Pressable
                    style={[styles.submitBtn, isSubmitting && styles.submitDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Salva esperienza</Text>
                    )}
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

function FormField({
    label,
    placeholder,
    control,
    name,
    error,
}: {
    label: string;
    placeholder: string;
    control: any;
    name: any;
    error?: string;
}) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                        style={[styles.input, error && styles.inputErr]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textPlaceholder}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
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
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 12,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    navBack: { width: 80 },
    navBackText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    navTitle: { ...typography.h3, fontSize: 17 },

    container: { padding: spacing.lg, gap: spacing.md, paddingBottom: 80 },
    sectionLabel: { ...typography.label, marginBottom: -spacing.xs },

    // Type grid
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.bgCard,
        borderRadius: radius.full,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    typeEmoji: { fontSize: 14 },
    typeLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },

    // CEFR selector
    cefrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    cefrChip: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.md,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cefrChipSelected: {
        backgroundColor: colors.language_cert + '22',
        borderColor: colors.language_cert,
    },
    cefrLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
    cefrLabelSelected: { color: colors.language_cert },

    // Fields
    fieldWrap: { gap: 6 },
    label: { ...typography.label, marginBottom: 2 },
    input: {
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 13,
        fontSize: 15,
        color: colors.textPrimary,
    },
    inputErr: { borderColor: colors.error },
    inputDisabled: { opacity: 0.4 },
    textarea: { minHeight: 110 },
    errText: { fontSize: 12, color: colors.error },

    // Dates
    row: { flexDirection: 'row', gap: spacing.sm },
    halfField: { flex: 1, gap: 6 },

    // Toggle
    toggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },

    // Submit
    submitBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    submitDisabled: { opacity: 0.6 },
    submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
