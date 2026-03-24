import React, { useState } from 'react';
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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, radius, spacing } from '../../src/theme';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    email: z.string().email('Email non valida'),
});
type FormValues = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen() {
    const { resetPassword } = useAuth();
    const router = useRouter();
    const [sent, setSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    const onSubmit = async ({ email }: FormValues) => {
        setServerError(null);
        const { error } = await resetPassword(email);
        if (error) {
            setServerError(error);
        } else {
            setSentEmail(email);
            setSent(true);
        }
    };

    // ── Success state ────────────────────────────────────────────────────────

    if (sent) {
        return (
            <View style={styles.centered}>
                <View style={styles.successIcon}>
                    <Ionicons name="mail-outline" size={32} color={colors.primary} />
                </View>
                <Text style={styles.successTitle}>Email inviata</Text>
                <Text style={styles.successBody}>
                    Abbiamo inviato un link per reimpostare la password a{'\n'}
                    <Text style={styles.emailHighlight}>{sentEmail}</Text>
                    {'\n\n'}Controlla la casella di posta e clicca sul link. Potrebbe impiegare qualche minuto.
                </Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.backLink}>← Torna al login</Text>
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
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
                    <Text style={styles.backBtnText}>Torna al login</Text>
                </Pressable>

                <View style={styles.header}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="key-outline" size={28} color="#fff" />
                    </View>
                    <Text style={styles.title}>Password dimenticata?</Text>
                    <Text style={styles.subtitle}>
                        Inserisci la tua email e ti inviamo un link per reimpostare la password.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value, onBlur } }) => (
                                <View style={[styles.inputRow, errors.email && styles.inputRowErr]}>
                                    <Ionicons name="mail-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholderTextColor={colors.textPlaceholder}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholder="tu@email.com"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        autoComplete="email"
                                    />
                                </View>
                            )}
                        />
                        {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
                    </View>

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
                            : <Text style={styles.btnText}>Invia link di reset</Text>
                        }
                    </Pressable>

                    <View style={styles.forgotEmailNote}>
                        <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
                        <Text style={styles.forgotEmailText}>
                            Non ricordi l'email con cui ti sei registrato? Contatta il supporto.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 48,
    },

    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32 },
    backBtnText: { color: colors.textMuted, fontSize: 14 },

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
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 20 },

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

    forgotEmailNote: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
    forgotEmailText: { fontSize: 12, color: colors.textMuted, flex: 1, lineHeight: 17 },

    // Success state
    successIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary + '18',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
    successBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
    emailHighlight: { fontWeight: '700', color: colors.textPrimary },
    backLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
