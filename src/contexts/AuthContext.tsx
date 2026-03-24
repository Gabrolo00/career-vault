import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';

WebBrowser.maybeCompleteAuthSession();

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
}

interface AuthContextValue extends AuthState {
    signUp: (
        email: string,
        password: string,
        fullName: string
    ) => Promise<{ error: string | null }>;
    signIn: (
        email: string,
        password: string
    ) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<{ error: string | null }>;
    resendConfirmation: (email: string) => Promise<{ error: string | null }>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Set to true to require email confirmation before login.
 * When true: users must confirm via email → Netlify page → deep link.
 * When false: users can log in immediately after registration.
 *
 * Remember to also toggle "Enable email confirmations" in:
 * Supabase Dashboard → Authentication → Email → Enable email confirmations
 */
const REQUIRE_EMAIL_CONFIRMATION = true;

/**
 * Where Supabase redirects after email confirmation.
 * In production: the hosted landing page (e.g. https://careervault.netlify.app)
 * which then opens the app via deep link careervault://?code=XXX.
 * In dev (env var not set): falls back to the deep link directly (mobile only).
 */
const EMAIL_REDIRECT_URL =
    process.env.EXPO_PUBLIC_EMAIL_CONFIRM_URL || 'careervault://';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the session belongs to a user that confirmed their email. */
function isEmailConfirmed(s: Session | null): boolean {
    if (!s) return false;
    return !!s.user.email_confirmed_at;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session on mount
        supabase.auth.getSession().then(({ data }) => {
            const s = data.session;
            if (REQUIRE_EMAIL_CONFIRMATION && s && !isEmailConfirmed(s)) {
                supabase.auth.signOut();
                setLoading(false);
                return;
            }
            setSession(s);
            setUser(s?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                if (REQUIRE_EMAIL_CONFIRMATION && newSession && !isEmailConfirmed(newSession)) {
                    supabase.auth.signOut();
                    setLoading(false);
                    return;
                }
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = useCallback(
        async (email: string, password: string, fullName: string) => {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: EMAIL_REDIRECT_URL,
                },
            });

            // Check if user was returned but it's a fake signup (identities array is empty for duplicate users)
            if (data?.user && data.user.identities && data.user.identities.length === 0) {
                return { error: 'User already registered' };
            }
            return { error: error?.message ?? null };
        },
        []
    );

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error?.message ?? null };
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const redirectUrl = Linking.createURL('/auth/callback');
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
        });
        if (error || !data.url) return { error: error?.message ?? 'Errore OAuth' };

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success') {
            const parsed = Linking.parse(result.url);
            const code = parsed.queryParams?.code as string | undefined;
            if (code) {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                if (exchangeError) return { error: exchangeError.message };
            }
        }
        return { error: null };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const deleteAccount = useCallback(async () => {
        const { error } = await supabase.rpc('delete_user_account');
        if (error) return { error: error.message };
        await supabase.auth.signOut();
        return { error: null };
    }, []);

    const resendConfirmation = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: { emailRedirectTo: EMAIL_REDIRECT_URL },
        });
        return { error: error?.message ?? null };
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'careervault://reset-password',
        });
        return { error: error?.message ?? null };
    }, []);

    return (
        <AuthContext.Provider
            value={{ session, user, loading, signUp, signIn, signInWithGoogle, signOut, deleteAccount, resendConfirmation, resetPassword }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
