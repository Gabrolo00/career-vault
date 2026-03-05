import React from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, TAB_BAR_HEIGHT, TAB_BAR_BOTTOM } from '../../src/theme';

// ─── Floating Pill Tab Bar ────────────────────────────────────────────────────

const TAB_CONFIG = [
    { name: 'index', label: 'Vault', icon: 'server' },
    { name: 'generate', label: 'Genera', icon: 'flash' },
    { name: 'history', label: 'Storico', icon: 'time' },
    { name: 'profile', label: 'Profilo', icon: 'person' },
] as const;

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.barWrapper} pointerEvents="box-none">
            <View style={styles.bar}>
                {state.routes.map((route, index) => {
                    const cfg = TAB_CONFIG.find(t => t.name === route.name) ?? TAB_CONFIG[index];
                    const isFocused = state.index === index;
                    const color = isFocused ? colors.primary : colors.textMuted;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            style={styles.tabItem}
                            onPress={onPress}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                        >
                            {isFocused && <View style={styles.activeIndicator} />}
                            <Ionicons name={cfg.icon as any} size={22} color={color} />
                            <Text style={[styles.tabLabel, { color }]}>{cfg.label}</Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="generate" />
            <Tabs.Screen name="history" />
            <Tabs.Screen name="profile" />
        </Tabs>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    barWrapper: {
        position: 'absolute',
        bottom: TAB_BAR_BOTTOM,
        left: 20,
        right: 20,
        alignItems: 'center',
        pointerEvents: 'box-none',
    },
    bar: {
        flexDirection: 'row',
        height: TAB_BAR_HEIGHT,
        backgroundColor: colors.bgCard,
        borderRadius: 34,
        paddingHorizontal: 8,
        alignItems: 'center',
        width: '100%',
        // Elevation / shadow
        elevation: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        // Subtle blue border glow
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        height: '100%',
        borderRadius: 28,
    },
    activeIndicator: {
        position: 'absolute',
        top: 8,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary + '18',
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
});
