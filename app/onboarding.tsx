import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { updateProfile } from '../src/services/profileService';
import { colors, radius, spacing } from '../src/theme';

// ─── Slides config ────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Slide {
    key: string;
    icon: IoniconName;
    accentColor: string;
    label: string;
    title: string;
    body: string;
}

const SLIDES: Slide[] = [
    {
        key: 'vault',
        icon: 'server-outline',
        accentColor: colors.primary,
        label: 'Il tuo archivio',
        title: 'Il Caveau della tua Carriera',
        body: 'Centralizza esperienze, progetti, certificazioni e competenze in un unico archivio strutturato. Sicuro, ordinato, sempre disponibile.',
    },
    {
        key: 'import',
        icon: 'cloud-upload-outline',
        accentColor: colors.secondary,
        label: 'Importazione rapida',
        title: 'Porta tutto in un tap',
        body: 'Hai già un CV in PDF? Importalo. L\'AI estrae automaticamente ogni esperienza e la struttura nel vault, pronta per essere riutilizzata.',
    },
    {
        key: 'generate',
        icon: 'flash-outline',
        accentColor: colors.project,
        label: 'Generazione AI',
        title: 'CV su Misura in pochi secondi',
        body: 'Incolla una Job Description. L\'AI analizza il tuo vault e costruisce un CV o una Cover Letter allineati al ruolo, con le parole chiave giuste.',
    },
    {
        key: 'ready',
        icon: 'rocket-outline',
        accentColor: colors.success,
        label: 'Pronto',
        title: 'Il tuo futuro inizia ora',
        body: 'Sei a un passo dal colloquio dei tuoi sogni.\nAggiungi la tua prima esperienza o importa un CV esistente e lascia che l\'AI faccia il resto.',
    },
];

const LAST_INDEX = SLIDES.length - 1;

// ─── Dot indicators ───────────────────────────────────────────────────────────

function Dots({ current, total, onPress }: { current: number; total: number; onPress: (i: number) => void }) {
    return (
        <View style={styles.dotsRow}>
            {Array.from({ length: total }).map((_, i) => (
                <Pressable key={i} onPress={() => onPress(i)} hitSlop={10}>
                    <View
                        style={[
                            styles.dot,
                            i === current && styles.dotActive,
                            i < current && styles.dotPast,
                        ]}
                    />
                </Pressable>
            ))}
        </View>
    );
}

// ─── Single slide ─────────────────────────────────────────────────────────────

function SlideView({ slide }: { slide: Slide }) {
    return (
        <View style={styles.slide}>
            {/* Icon container */}
            <View style={[styles.iconRing, { borderColor: slide.accentColor + '40' }]}>
                <View style={[styles.iconInner, { backgroundColor: slide.accentColor + '16' }]}>
                    <Ionicons name={slide.icon} size={52} color={slide.accentColor} />
                </View>
            </View>

            {/* Label chip */}
            <View style={[styles.labelChip, { backgroundColor: slide.accentColor + '18', borderColor: slide.accentColor + '35' }]}>
                <Text style={[styles.labelText, { color: slide.accentColor }]}>{slide.label}</Text>
            </View>

            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideBody}>{slide.body}</Text>
        </View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const isLast = currentIndex === LAST_INDEX;

    const goToIndex = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setCurrentIndex(index);
    };

    const goNext = () => goToIndex(currentIndex + 1);

    const handleStart = async () => {
        try {
            setLoading(true);
            await updateProfile({ onboarding_completed: true });
        } catch {
            // Non-blocking — se fallisce l'aggiornamento entra comunque
        } finally {
            setLoading(false);
            router.replace('/(tabs)');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header: logo wordmark */}
            <View style={styles.header}>
                <Text style={styles.logoText}>
                    Career<Text style={{ color: colors.primary }}>Vault</Text>
                </Text>
                {!isLast && (
                    <Pressable
                        style={styles.skipBtn}
                        onPress={() => {
                            flatListRef.current?.scrollToIndex({ index: LAST_INDEX, animated: true });
                            setCurrentIndex(LAST_INDEX);
                        }}
                    >
                        <Text style={styles.skipText}>Salta</Text>
                    </Pressable>
                )}
            </View>

            {/* Carousel */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(s) => s.key}
                horizontal
                pagingEnabled
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <SlideView slide={item} />}
                style={styles.flatList}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setCurrentIndex(index);
                }}
            />

            {/* Bottom controls */}
            <View style={styles.bottomControls}>
                <Dots current={currentIndex} total={SLIDES.length} onPress={goToIndex} />

                {isLast ? (
                    <Pressable
                        style={[styles.ctaBtn, { backgroundColor: colors.success }]}
                        onPress={handleStart}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <View style={styles.btnInner}>
                                <Text style={styles.ctaBtnText}>Vai alla Dashboard</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </View>
                        )}
                    </Pressable>
                ) : (
                    <Pressable style={styles.nextBtn} onPress={goNext}>
                        <View style={styles.btnInner}>
                            <Text style={styles.nextBtnText}>Avanti</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </View>
                    </Pressable>
                )}
            </View>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 48,
        paddingBottom: spacing.md,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: -0.3,
    },
    skipBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radius.full,
        backgroundColor: colors.bgCard,
        borderWidth: 1,
        borderColor: colors.border,
    },
    skipText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
    },

    flatList: {
        flex: 1,
    },

    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },

    iconRing: {
        width: 136,
        height: 136,
        borderRadius: 68,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    iconInner: {
        width: 108,
        height: 108,
        borderRadius: 54,
        alignItems: 'center',
        justifyContent: 'center',
    },

    labelChip: {
        borderRadius: radius.full,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    labelText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    slideTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        letterSpacing: -0.5,
        lineHeight: 32,
    },
    slideBody: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 24,
        textAlign: 'center',
    },

    bottomControls: {
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 48 : 32,
        gap: spacing.lg,
        alignItems: 'center',
    },

    dotsRow: {
        flexDirection: 'row',
        gap: 7,
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
    },
    dotActive: {
        width: 22,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    dotPast: {
        backgroundColor: colors.textMuted,
    },

    btnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },

    nextBtn: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingVertical: 16,
        alignItems: 'center',
    },
    nextBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },

    ctaBtn: {
        width: '100%',
        borderRadius: radius.lg,
        paddingVertical: 16,
        alignItems: 'center',
    },
    ctaBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
