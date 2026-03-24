import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../src/services/supabase';
import { colors, radius, spacing } from '../src/theme';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    password: z.string()
        .min(8, 'Minimo 8 caratteri')
        .regex(/[A-Z]/, 'Deve contenere almeno una lettera maiuscola')
        .regex(/[0-9]/, 'Deve contenere almeno un numero')
        .regex(/[^A-Za-z0-9]/, 'Deve contenere almeno un simbolo (es. !@#$%)'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Le password non coincidono',
    path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;
type Stage = 'loading' | 'form' | 'success' | 'error';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ResetPasswordScreen() {
    const router = useRouter();
    const url = Linking.useURL();
    const [stage, setStage] = useState<Stage>('loading');
    const [stageError, setStageError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    // Scambia il code dal deep link con una sessione temporanea
    useEffect(() => {
        if (!url) return;
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code as string | undefined;
        if (!code) {
            setStageError('Link non valido o scaduto. Richiedi un nuovo link dal login.');
            setStage('error');
            return;
        }
        supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            if (error) {
                setStageError(error.message);
                setStage('error');
            } else {
                setStage('form');
            }
        });
    }, [url]);

    const onSubmit = async ({ password }: FormValues) => {
        setServerError(null);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            setServerError(error.message);
            return;
        }
        await supabase.auth.signOut();
        setStage('success');
    };

    // ── Loading ──────────────────────────────────────────────────────────────

    if (stage === 'loading') {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Verifica link in corso…</Text>
            </View>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────

    if (stage === 'error') {
        return (
            <View style={styles.centered}>
                <View style={[styles.stateIcon, { backgroundColor: colors.errorBg }]}>
                    <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
                </View>
                <Text style={styles.stateTitle}>Link non valido</Text>
                <Text style={styles.stateBody}>
                    {stageError ?? 'Il link potrebbe essere scaduto. Richiedi un nuovo link dalla schermata di login.'}
                </Text>
                <Pressable style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.btnText}>Torna al login</Text>
                </Pressable>
            </View>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────

    if (stage === 'success') {
        return (
            <View style={styles.centered}>
                <View style={[styles.stateIcon, { backgroundColor: colors.successBg }]}>
                    <Ionicons name="checkmark-circle-outline" size={36} color={colors.success} />
                </View>
                <Text style={styles.stateTitle}>Password aggiornata</Text>
                <Text style={styles.stateBody}>
                    La tua password è stata reimpostata con successo. Ora puoi accedere con la nuova password.
                </Text>
                <Pressable style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
                    <Text style={styles.btnText}>Vai al login</Text>
                </Pressable>
            </View>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="lock-closed" size={28} color="#fff" />
                    </View>
                    <Text style={styles.title}>Nuova password</Text>
                    <Text style={styles.subtitle}>Scegli una password sicura per il tuo account.</Text>
                </View>

                <View style={styles.card}>
                    <PasswordField
                        label="Nuova password"
                        control={control}
                        name="password"
                        error={errors.password?.message}
                        placeholder="••••••••"
                    />
                    <PasswordField
                        label="Conferma password"
                        control={control}
                        name="confirmPassword"
                        error={errors.confirmPassword?.message}
                        placeholder="••••••••"
                    />

                    {serverError && (
                        <View style={styles.errorBanner}>
                            <Ionicons name="warning-outline" size={14} color={colors.error} />
                            <Text style={styles.errorText}>{serverError}</Text>
                        </View>
                    )}

                    <Pressable
                        style={[styles.btn, isSubmitting && styles.btnDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Aggiorna password</Text>
                        }
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordField({ label, control, name, error, placeholder }: {
    label: string; control: any; name: any; error?: string; placeholder: string;
}) {
    const [hidden, setHidden] = useState(true);
    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value, onBlur } }) => (
                    <View style={[styles.inputRow, error && styles.inputRowErr]}>
                        <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={colors.textPlaceholder}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            secureTextEntry={hidden}
                            placeholder={placeholder}
                            autoCapitalize="none"
                        />
                        <Pressable onPress={() => setHidden(h => !h)} hitSlop={8}>
                            <Ionicons
                                name={hidden ? 'eye-outline' : 'eye-off-outline'}
                                size={18}
                                color={colors.textMuted}
                            />
                        </Pressable>
                    </View>
                )}
            />
            {error && <Text style={styles.fieldError}>{error}</Text>}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    centered: {
        flex: 1,
        backgroundColor: colors.bg,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        gap: 16,
    },
    loadingText: { color: colors.textMuted, marginTop: 8, fontSize: 14 },

    stateIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stateTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
    stateBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 21, maxWidth: 300 },

    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 48,
    },
    header: { alignItems: 'center', marginBottom: 28 },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, textAlign: 'center' },

    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
    },
    field: { gap: 6 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        height: 50,
        gap: spacing.sm,
    },
    inputRowErr: { borderColor: colors.error },
    inputIcon: { width: 20 },
    input: { flex: 1, fontSize: 15, color: colors.textPrimary },
    fieldError: { fontSize: 12, color: colors.error },

    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.errorBg,
        borderRadius: radius.md,
        padding: spacing.sm,
    },
    errorText: { fontSize: 13, color: colors.error, flex: 1 },

    btn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
