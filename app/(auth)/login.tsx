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
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../src/contexts/AuthContext';

// ─── Validation ───────────────────────────────────────────────────────────────

const schema = z.object({
    email: z.string().email('Email non valida'),
    password: z.string().min(6, 'Minimo 6 caratteri'),
});

type FormValues = z.infer<typeof schema>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
    const { signIn } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async ({ email, password }: FormValues) => {
        setServerError(null);
        const { error } = await signIn(email, password);
        if (error) setServerError(error);
        // On success, AuthGuard in _layout.tsx will redirect automatically
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>CareerVault</Text>
                    <Text style={styles.subtitle}>Accedi al tuo vault</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value, onBlur } }) => (
                                <TextInput
                                    style={[styles.input, errors.email && styles.inputError]}
                                    placeholder="tu@email.com"
                                    placeholderTextColor="#6B7280"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email.message}</Text>
                        )}
                    </View>

                    {/* Password */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, value, onBlur } }) => (
                                <TextInput
                                    style={[styles.input, errors.password && styles.inputError]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#6B7280"
                                    secureTextEntry
                                    autoComplete="password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                />
                            )}
                        />
                        {errors.password && (
                            <Text style={styles.errorText}>{errors.password.message}</Text>
                        )}
                    </View>

                    {/* Server error */}
                    {serverError && (
                        <View style={styles.serverErrorContainer}>
                            <Text style={styles.serverErrorText}>{serverError}</Text>
                        </View>
                    )}

                    {/* Submit */}
                    <Pressable
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Accedi</Text>
                        )}
                    </Pressable>

                    {/* Link to signup */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#0F172A' },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    header: { alignItems: 'center', marginBottom: 48 },
    logo: {
        fontSize: 36,
        fontWeight: '800',
        color: '#6366F1',
        letterSpacing: -1,
    },
    subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 8 },
    form: { gap: 16 },
    field: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: '#CBD5E1' },
    input: {
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#F1F5F9',
    },
    inputError: { borderColor: '#EF4444' },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: 2 },
    serverErrorContainer: {
        backgroundColor: '#450A0A',
        borderRadius: 10,
        padding: 12,
    },
    serverErrorText: { color: '#FCA5A5', fontSize: 14, textAlign: 'center' },
    button: {
        backgroundColor: '#6366F1',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    footerText: { color: '#64748B', fontSize: 14 },
    link: { color: '#6366F1', fontSize: 14, fontWeight: '600' },
});
