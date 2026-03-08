import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { useProfile } from '../../src/hooks/useProfile';
import { colors, radius, spacing, typography, SCREEN_PADDING_BOTTOM } from '../../src/theme';
import { ProfileUpdate } from '../../src/types/database';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { profile, loading, saving, error, refresh, save, changeAvatar } = useProfile();

    const [fullName, setFullName] = useState('');
    const [headline, setHeadline] = useState('');
    const [nativeLanguage, setNativeLanguage] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [dirty, setDirty] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Populate fields when profile loads
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name ?? '');
            setHeadline(profile.headline ?? '');
            setNativeLanguage(profile.native_language ?? '');
            setPhone(profile.phone ?? '');
            setCity(profile.city ?? '');
            setLinkedin(profile.linkedin_url ?? '');
            setPortfolio(profile.portfolio_url ?? '');
            setDirty(false);
        }
    }, [profile]);

    const markDirty = (setter: (v: string) => void) => (v: string) => {
        setter(v);
        setDirty(true);
    };

    const handleSave = async () => {
        const payload: ProfileUpdate = {
            full_name: fullName.trim() || null,
            headline: headline.trim() || null,
            native_language: nativeLanguage.trim() || null,
            phone: phone.trim() || null,
            city: city.trim() || null,
            linkedin_url: linkedin.trim() || null,
            portfolio_url: portfolio.trim() || null,
        };
        try {
            await save(payload);
            setDirty(false);
            Alert.alert('Salvato', 'Profilo aggiornato con successo!');
        } catch {
            Alert.alert('Errore', 'Impossibile salvare il profilo. Riprova.');
        }
    };

    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permesso negato', 'Abilita accesso alla libreria foto nelle impostazioni.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        const mimeType = asset.mimeType ?? 'image/jpeg';

        try {
            setAvatarLoading(true);
            await changeAvatar(asset.uri, mimeType);
        } catch {
            Alert.alert('Errore', 'Impossibile caricare la foto. Riprova.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Logout', 'Sei sicuro di voler uscire?', [
            { text: 'Annulla', style: 'cancel' },
            { text: 'Esci', style: 'destructive', onPress: signOut },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Profilo</Text>
                <Text style={styles.subtitle}>{user?.email}</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
                        {avatarLoading ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : profile?.avatar_url ? (
                            <Image
                                source={{ uri: profile.avatar_url }}
                                style={styles.avatarImg}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={44} color={colors.textMuted} />
                            </View>
                        )}
                        <View style={styles.cameraBadge}>
                            <Ionicons name="camera" size={14} color="#fff" />
                        </View>
                    </Pressable>
                    <Text style={styles.avatarHint}>Tocca per cambiare foto</Text>
                </View>

                {/* Error banner */}
                {error && (
                    <View style={styles.errorBanner}>
                        <Ionicons name="warning" size={14} color={colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Section: Identità */}
                <SectionHeader icon="person-outline" label="Identità" />

                <Field
                    label="Nome completo"
                    value={fullName}
                    onChangeText={markDirty(setFullName)}
                    placeholder="Mario Rossi"
                    icon="person"
                />
                <Field
                    label="Headline professionale"
                    value={headline}
                    onChangeText={markDirty(setHeadline)}
                    placeholder="Senior Frontend Developer @ Acme"
                    icon="briefcase"
                />
                <Field
                    label="Lingua madre"
                    value={nativeLanguage}
                    onChangeText={markDirty(setNativeLanguage)}
                    placeholder="Italiano"
                    icon="language"
                />

                {/* Section: Contatti */}
                <SectionHeader icon="call-outline" label="Contatti" />

                <Field
                    label="Telefono"
                    value={phone}
                    onChangeText={markDirty(setPhone)}
                    placeholder="+39 333 123 4567"
                    icon="call"
                    keyboardType="phone-pad"
                />
                <Field
                    label="Città / Indirizzo"
                    value={city}
                    onChangeText={markDirty(setCity)}
                    placeholder="Milano, Italia"
                    icon="location"
                />

                {/* Section: Link */}
                <SectionHeader icon="link-outline" label="Link" />

                <Field
                    label="LinkedIn"
                    value={linkedin}
                    onChangeText={markDirty(setLinkedin)}
                    placeholder="https://linkedin.com/in/tuo-nome"
                    icon="logo-linkedin"
                    keyboardType="url"
                    autoCapitalize="none"
                />
                <Field
                    label="Portfolio / Sito"
                    value={portfolio}
                    onChangeText={markDirty(setPortfolio)}
                    placeholder="https://tuosito.com"
                    icon="globe"
                    keyboardType="url"
                    autoCapitalize="none"
                />

                {/* Save button */}
                <Pressable
                    style={[styles.saveBtn, (!dirty || saving) && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={!dirty || saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.saveBtnInner}>
                            <Ionicons name="checkmark" size={18} color="#fff" />
                            <Text style={styles.saveBtnText}>Salva profilo</Text>
                        </View>
                    )}
                </Pressable>

                {/* Sign out */}
                <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={18} color={colors.error} />
                    <Text style={styles.signOutText}>Disconnetti</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
    return (
        <View style={styles.sectionHeader}>
            <Ionicons name={icon as any} size={14} color={colors.textMuted} />
            <Text style={styles.sectionLabel}>{label}</Text>
        </View>
    );
}

function Field({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    keyboardType,
    autoCapitalize,
}: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    icon: string;
    keyboardType?: any;
    autoCapitalize?: any;
}) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldInputRow}>
                <Ionicons name={icon as any} size={16} color={colors.textMuted} style={styles.fieldIcon} />
                <TextInput
                    style={styles.fieldInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize ?? 'words'}
                    autoCorrect={false}
                />
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const AVATAR_SIZE = 100;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    header: {
        paddingTop: 60,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    title: { ...typography.h2, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.textMuted },

    content: {
        padding: spacing.lg,
        gap: spacing.md,
        paddingBottom: SCREEN_PADDING_BOTTOM,
    },

    // Avatar
    avatarSection: { alignItems: 'center', paddingVertical: spacing.sm },
    avatarWrap: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: colors.bgCard,
        borderWidth: 2,
        borderColor: colors.primary + '44',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
    },
    avatarImg: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },
    avatarPlaceholder: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.bg,
    },
    avatarHint: { marginTop: 8, fontSize: 12, color: colors.textMuted },

    // Error
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.errorBg,
        borderRadius: radius.md,
        padding: spacing.sm,
    },
    errorText: { fontSize: 13, color: colors.error, flex: 1 },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // Field
    fieldWrap: { gap: 6 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
    fieldInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgInput,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        gap: spacing.sm,
        height: 48,
    },
    fieldIcon: { width: 20 },
    fieldInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
    },

    // Save button
    saveBtn: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

    // Sign out
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.errorBg,
        borderRadius: radius.md,
        paddingVertical: 14,
    },
    signOutText: { color: colors.error, fontWeight: '700', fontSize: 15 },
});
