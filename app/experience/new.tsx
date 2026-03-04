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

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    type: z.enum(['work', 'education', 'project', 'certification', 'volunteer']),
    title: z.string().min(2, 'Il titolo è obbligatorio'),
    organization: z.string().optional(),
    location: z.string().optional(),
    start_date: z.string().optional().or(z.literal('')),
    end_date: z.string().optional().or(z.literal('')),
    is_current: z.boolean(),
    description: z.string().optional(),
    skills: z.string(), // comma-separated, parsed on submit
    tags: z.string(),   // comma-separated
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
            tags: '',
        },
    });

    const isCurrent = watch('is_current');
    const selectedType = watch('type');

    const onSubmit = async (values: FormValues) => {
        try {
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
                tags: values.tags
                    ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
                metadata: {},
            });
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

                {/* Title */}
                <FormField
                    label="Titolo *"
                    placeholder="es. Senior Software Engineer"
                    control={control}
                    name="title"
                    error={errors.title?.message}
                />

                {/* Organization */}
                <FormField
                    label="Azienda / Istituto"
                    placeholder="es. Google"
                    control={control}
                    name="organization"
                    error={errors.organization?.message}
                />

                {/* Location */}
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

                {/* Skills */}
                <FormField
                    label="Skills (separati da virgola)"
                    placeholder="es. React Native, TypeScript, Supabase"
                    control={control}
                    name="skills"
                    error={errors.skills?.message}
                />

                {/* Tags */}
                <FormField
                    label="Tag (separati da virgola)"
                    placeholder="es. backend, leadership, agile"
                    control={control}
                    name="tags"
                    error={errors.tags?.message}
                />

                {/* Submit */}
                <Pressable
                    style={[styles.submitBtn, isSubmitting && styles.submitDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>💾 Salva esperienza</Text>
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
