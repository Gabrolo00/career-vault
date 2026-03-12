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
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, radius, spacing } from '../../src/theme';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
    fullName: z.string().min(2, 'Inserisci il tuo nome completo'),
    email: z.string().email('Email non valida'),
    password: z.string()
        .min(8, 'Minimo 8 caratteri')
        .regex(/[A-Z]/, 'Deve contenere almeno una lettera maiuscola')
        .regex(/[0-9]/, 'Deve contenere almeno un numero')
        .regex(/[^A-Za-z0-9]/, 'Deve contenere almeno un simbolo (es. !@#$%)'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Le password non coincidono',
    path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignupScreen() {
    const { signUp } = useAuth();
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
    const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
    });

    const onSubmit = async ({ email, password, fullName }: FormValues) => {
        setServerError(null);
        setDuplicateEmail(null);
        const { error } = await signUp(email, password, fullName);
        if (error) {
            // Supabase auth error messages for duplicate emails can vary based on GoTrue settings
            const errorStr = error.toLowerCase();
            if (errorStr.includes('already registered') ||
                errorStr.includes('already been registered') ||
                errorStr.includes('user already') ||
                errorStr.includes('already exists')) {
                setDuplicateEmail(email);
            } else {
                setServerError(error);
            }
        } else {
            setRegisteredEmail(email);
        }
    };

    // ── Success state ────────────────────────────────────────────────────────

    if (registeredEmail) {
        return (
            <View style={styles.flex}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="mail" size={34} color={colors.primary} />
                    </View>
                    <Text style={styles.successTitle}>Controlla la tua email</Text>
                    <Text style={styles.successBody}>
                        Abbiamo inviato un link di conferma a{'\n'}
                        <Text style={styles.successEmail}>{registeredEmail}</Text>
                    </Text>
                    <Text style={styles.successHint}>
                        Clicca il link nell'email per attivare il tuo account, poi accedi con le tue credenziali.
                    </Text>
                    <Pressable style={styles.btn} onPress={() => router.replace('/(auth)/login')}>
                        <Ionicons name="log-in-outline" size={18} color="#fff" />
                        <Text style={styles.btnText}>Vai al login</Text>
                    </Pressable>
                </View>
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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="shield-checkmark" size={30} color="#fff" />
                    </View>
                    <Text style={styles.logoText}>CareerVault</Text>
                    <Text style={styles.subtitle}>Crea il tuo account</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <AuthField
                        label="Nome completo"
                        icon="person-outline"
                        control={control}
                        name="fullName"
                        error={errors.fullName?.message}
                        placeholder="Mario Rossi"
                        autoComplete="name"
                    />

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
                    />

                    <AuthField
                        label="Conferma password"
                        icon="lock-closed-outline"
                        control={control}
                        name="confirmPassword"
                        error={errors.confirmPassword?.message}
                        placeholder="••••••••"
                        secureTextEntry
                    />

                    {duplicateEmail && (
                        <View style={styles.warnBanner}>
                            <Ionicons name="person-circle-outline" size={16} color={colors.warning} />
                            <View style={{ flex: 1, gap: 6 }}>
                                <Text style={styles.warnText}>
                                    L'email <Text style={styles.warnEmail}>{duplicateEmail}</Text> è già associata a un account.
                                </Text>
                                <Pressable onPress={() => router.replace('/(auth)/login')}>
                                    <Text style={styles.warnLink}>Vai al login →</Text>
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
                            <Text style={styles.btnText}>Crea account</Text>
                        )}
                    </Pressable>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Hai già un account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Pressable>
                                <Text style={styles.link}>Accedi</Text>
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

    // Warning banner (duplicate email)
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
    warnLink: { fontSize: 13, fontWeight: '700', color: colors.primary },

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 15,
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Footer
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: colors.textMuted, fontSize: 14 },
    link: { color: colors.primary, fontSize: 14, fontWeight: '600' },

    // Success state
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary + '18',
        borderWidth: 1,
        borderColor: colors.primary + '40',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    successBody: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    successEmail: {
        color: colors.primary,
        fontWeight: '600',
    },
    successHint: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: spacing.md,
    },
});
