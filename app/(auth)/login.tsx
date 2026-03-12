import React, { useState, useEffect, useRef } from 'react';
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
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, radius, spacing } from '../../src/theme';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    email: z.string().email('Email non valida'),
    password: z.string().min(6, 'Minimo 6 caratteri'),
});

type FormValues = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
    const { signIn, resendConfirmation } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);
    const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    const {
        control,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async ({ email, password }: FormValues) => {
        setServerError(null);
        setUnconfirmedEmail(null);
        setResendSuccess(false);
        const { error } = await signIn(email, password);
        if (error) {
            if (error.toLowerCase().includes('email not confirmed') || error.toLowerCase().includes('not confirmed')) {
                setUnconfirmedEmail(email);
            } else {
                setServerError(error);
            }
        }
    };

    const handleResend = async () => {
        if (!unconfirmedEmail || resendCooldown > 0) return;
        setResendLoading(true);
        setResendSuccess(false);
        const { error } = await resendConfirmation(unconfirmedEmail);
        setResendLoading(false);
        if (!error) {
            setResendSuccess(true);
            setResendCooldown(30);
            cooldownRef.current = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(cooldownRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="shield-checkmark" size={30} color="#fff" />
                    </View>
                    <Text style={styles.logoText}>CareerVault</Text>
                    <Text style={styles.subtitle}>Accedi al tuo vault professionale</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <AuthField
                        label="Email"
                        icon="mail-outline"
                        control={control}
                        name="email"
                        error={errors.email?.message}
                        placeholder="tu@email.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />

                    <AuthField
                        label="Password"
                        icon="lock-closed-outline"
                        control={control}
                        name="password"
                        error={errors.password?.message}
                        placeholder="••••••••"
                        secureTextEntry
                        autoComplete="password"
                    />

                    {unconfirmedEmail && (
                        <View style={styles.warnBanner}>
                            <Ionicons name="mail-unread-outline" size={16} color={colors.warning} />
                            <View style={{ flex: 1, gap: 8 }}>
                                <Text style={styles.warnText}>
                                    Conferma la tua email prima di accedere.{'\n'}
                                    <Text style={styles.warnEmail}>{unconfirmedEmail}</Text>
                                </Text>
                                {resendSuccess && (
                                    <Text style={styles.warnHint}>Email inviata! Controlla la tua casella.</Text>
                                )}
                                <Pressable
                                    style={[styles.resendBtn, (resendCooldown > 0 || resendLoading) && styles.resendBtnDisabled]}
                                    onPress={handleResend}
                                    disabled={resendCooldown > 0 || resendLoading}
                                >
                                    {resendLoading ? (
                                        <ActivityIndicator size="small" color={colors.warning} />
                                    ) : (
                                        <Text style={styles.resendBtnText}>
                                            {resendCooldown > 0 ? `Reinvia tra ${resendCooldown}s` : 'Reinvia email di conferma'}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    )}

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
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.btnText}>Accedi</Text>
                        )}
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Non hai un account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <Pressable>
                                <Text style={styles.link}>Registrati</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

function AuthField({ label, icon, control, name, error, secureTextEntry, ...inputProps }: {
    label: string;
    icon: string;
    control: any;
    name: any;
    error?: string;
    secureTextEntry?: boolean;
    [key: string]: any;
}) {
    const [hidden, setHidden] = useState(true);
    const isPassword = !!secureTextEntry;

    return (
        <View style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value, onBlur } }) => (
                    <View style={[styles.inputRow, error && styles.inputRowErr]}>
                        <Ionicons name={icon as any} size={16} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={colors.textPlaceholder}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            secureTextEntry={isPassword ? hidden : false}
                            {...inputProps}
                        />
                        {isPassword && (
                            <Pressable onPress={() => setHidden(h => !h)} hitSlop={8}>
                                <Ionicons
                                    name={hidden ? 'eye-outline' : 'eye-off-outline'}
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </Pressable>
                        )}
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
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 48,
    },

    // Header
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
    logoText: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: -0.5,
    },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6 },

    // Card
    card: {
        backgroundColor: colors.bgCard,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing.md,
    },

    // Field
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

    // Warning banner (unconfirmed email)
    warnBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: colors.warningBg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.warning + '50',
        padding: spacing.sm,
    },
    warnText: { fontSize: 13, color: colors.warning, lineHeight: 19 },
    warnEmail: { fontWeight: '700' },
    warnHint: { fontSize: 12, color: colors.warning + 'CC' },
    resendBtn: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.warning,
        borderRadius: radius.sm,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    resendBtnDisabled: { opacity: 0.5 },
    resendBtnText: { fontSize: 12, fontWeight: '700', color: colors.warning },

    // Error banner
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.errorBg,
        borderRadius: radius.md,
        padding: spacing.sm,
    },
    errorText: { fontSize: 13, color: colors.error, flex: 1 },

    // Button
    btn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Footer
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: colors.textMuted, fontSize: 14 },
    link: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
