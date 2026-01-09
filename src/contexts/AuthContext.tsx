import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { getTrialExpiryDate } from '@/lib/stripe';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_premium: boolean;
  premium_expires_at: string | null;
  is_trial: boolean;
  trial_expires_at: string | null;
  has_used_trial: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isPremium: boolean;
  isTrial: boolean;
  trialDaysRemaining: number | null;
  hasUsedTrial: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  upgradeToPremium: (billingCycle?: 'monthly' | 'annual') => Promise<void>;
  startTrial: () => Promise<{ success: boolean; error?: string }>;
  cancelTrial: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const AUTH_TIMEOUT_MS = 20000;

const safeLSGet = (k: string) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const safeLSSet = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch {}
};
const safeLSRemove = (k: string) => {
  try { localStorage.removeItem(k); } catch {}
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initCompleteRef = useRef(false);

  const hasUsedTrial = useMemo(() => {
    return !!profile?.has_used_trial || safeLSGet('hasUsedTrial') === 'true';
  }, [profile]);

  const isTrial = useMemo(() => {
    if (profile?.is_trial && profile.trial_expires_at) {
      return new Date(profile.trial_expires_at) > new Date();
    }
    const localTrial = safeLSGet('isTrial');
    const expiry = safeLSGet('trialExpiry');
    return localTrial === 'true' && !!expiry && new Date(expiry) > new Date();
  }, [profile]);

  const trialDaysRemaining = useMemo(() => {
    const expiry = profile?.trial_expires_at || safeLSGet('trialExpiry');
    if (!expiry) return null;
    const diff = new Date(expiry).getTime() - Date.now();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
  }, [profile]);

  const isPremium = useMemo(() => {
    if (isTrial) return false;

    if (profile?.is_premium) {
      if (!profile.premium_expires_at) return true;
      return new Date(profile.premium_expires_at) > new Date();
    }

    const storedPlan = safeLSGet('userPlan');
    const expiry = safeLSGet('premiumExpiry');

    if (storedPlan === 'premium') {
      if (!expiry || new Date(expiry) > new Date()) return true;
      safeLSRemove('userPlan');
      safeLSRemove('premiumExpiry');
    }

    return false;
  }, [profile, isTrial]);

  const buildFallbackProfile = (userId: string, email?: string): UserProfile => ({
    id: userId,
    email: email || '',
    full_name: '',
    avatar_url: '',
    is_premium: false,
    premium_expires_at: null,
    is_trial: safeLSGet('isTrial') === 'true',
    trial_expires_at: safeLSGet('trialExpiry'),
    has_used_trial: safeLSGet('hasUsedTrial') === 'true',
  });

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // ✅ tabela não existe / schema cache / etc -> não quebra o app
      if (error) {
        console.warn('fetchProfile error:', error);
        setProfile(buildFallbackProfile(userId, email));
        return;
      }

      if (!data) {
        setProfile(buildFallbackProfile(userId, email));
        return;
      }

      setProfile(data as UserProfile);
    } catch (e) {
      console.warn('fetchProfile exception:', e);
      setProfile(buildFallbackProfile(userId, email));
    }
  };

  useEffect(() => {
    if (initCompleteRef.current) return;
    initCompleteRef.current = true;

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let didTimeout = false;

    const finishLoading = () => {
      if (!isMounted) return;
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      try {
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email);
        } else {
          setProfile(null);
        }
      } finally {
        if (!didTimeout) finishLoading();
      }
    });

    timeoutId = setTimeout(() => {
      didTimeout = true;
      console.warn('Auth timeout: Supabase demorou. Continuando sem travar UI.');
      finishLoading();
    }, AUTH_TIMEOUT_MS);

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!isMounted) return;

        if (didTimeout) {
          if (!error && data?.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user.id, data.session.user.email);
          }
          return;
        }

        if (timeoutId) clearTimeout(timeoutId);

        if (error) {
          console.error('Erro ao obter sessão:', error);
          finishLoading();
          return;
        }

        const initialSession = data?.session ?? null;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id, initialSession.user.email);
        } else {
          setProfile(null);
        }

        finishLoading();
      })
      .catch((e) => {
        console.error('Erro na autenticação:', e);
        if (!didTimeout && timeoutId) clearTimeout(timeoutId);
        finishLoading();
      });

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) toast.error(error.message);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (error) toast.error(error.message);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error) setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      return { error };
    } catch (e) {
      console.warn('updateProfile exception:', e);
      // ✅ não quebra se tabela ainda não existe
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      return { error: null };
    }
  };

  const startTrial = async () => {
    if (hasUsedTrial) return { success: false, error: 'Trial já utilizado.' };
    if (!user) return { success: false, error: 'Você precisa estar logado para ativar o trial.' };

    const expiry = getTrialExpiryDate().toISOString();
    safeLSSet('isTrial', 'true');
    safeLSSet('trialExpiry', expiry);

    await updateProfile({
      is_trial: true,
      trial_expires_at: expiry,
    });

    toast.success('Trial ativado!');
    return { success: true };
  };

  const cancelTrial = async () => {
    safeLSRemove('isTrial');
    safeLSRemove('trialExpiry');
    safeLSSet('hasUsedTrial', 'true');

    if (user) {
      await updateProfile({
        is_trial: false,
        trial_expires_at: null,
        has_used_trial: true,
      });
    }
  };

  const upgradeToPremium = async (billingCycle: 'monthly' | 'annual' = 'annual') => {
    const expires = new Date();
    billingCycle === 'monthly'
      ? expires.setMonth(expires.getMonth() + 1)
      : expires.setFullYear(expires.getFullYear() + 1);

    safeLSSet('userPlan', 'premium');
    safeLSSet('premiumExpiry', expires.toISOString());
    safeLSSet('hasUsedTrial', 'true');

    if (user) {
      await updateProfile({
        is_premium: true,
        premium_expires_at: expires.toISOString(),
        is_trial: false,
        trial_expires_at: null,
        has_used_trial: true,
      });
    }

    toast.success('Premium ativado!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isPremium,
        isTrial,
        trialDaysRemaining,
        hasUsedTrial,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        upgradeToPremium,
        startTrial,
        cancelTrial,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
