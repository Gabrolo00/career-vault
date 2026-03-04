import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function AuthGuard() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!session && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (session && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    // Usa Stack (non Slot) e dichiara esplicitamente tutti i gruppi di route.
    // Questo evita il bug "Cannot read property 'stale' of undefined" in TabRouter
    // che si manifesta quando si torna indietro da stack annidati ai tab.
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="experience" />
            <Stack.Screen name="document" />
        </Stack>
    );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout() {
    return (
        <AuthProvider>
            <AuthGuard />
        </AuthProvider>
    );
}
