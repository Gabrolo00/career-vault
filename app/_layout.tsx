import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { supabase } from '../src/services/supabase';

// Keep in sync with REQUIRE_EMAIL_CONFIRMATION in AuthContext.tsx
const REQUIRE_EMAIL_CONFIRMATION = false;

// ─── Auth Guard ───────────────────────────────────────────────────────────────

function AuthGuard() {
    const { session, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const url = Linking.useURL();

    // Handling ref prevents AuthGuard from redirecting to tabs mid-confirmation
    const handlingDeepLink = useRef(false);

    // Handle email confirmation deep link: careervault://?code=XXX&type=signup
    // Only active when REQUIRE_EMAIL_CONFIRMATION = true
    useEffect(() => {
        if (!REQUIRE_EMAIL_CONFIRMATION) return;
        if (!url) return;
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code as string | undefined;
        if (!code) return;

        handlingDeepLink.current = true;
        supabase.auth.exchangeCodeForSession(code).finally(() => {
            // Email confirmed — sign out so the user logs in manually
            supabase.auth.signOut().finally(() => {
                handlingDeepLink.current = false;
                router.replace('/(auth)/login');
            });
        });
    }, [url]);

    useEffect(() => {
        if (loading || handlingDeepLink.current) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding';

        if (!session && !inAuthGroup && !inOnboarding) {
            router.replace('/(auth)/login');
            return;
        }

        if (session && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [session, loading, segments]);

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
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
