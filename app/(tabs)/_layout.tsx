import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.bgCard,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Vault',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 22, color }}>🗄️</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="generate"
                options={{
                    title: 'Genera',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 22, color }}>✨</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'Storico',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 22, color }}>📄</Text>
                    ),
                }}
            />
        </Tabs>
    );
}
