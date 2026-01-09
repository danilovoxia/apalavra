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

// Timeout para evitar travar se o Supabase estiver lento
const AUTH_TIMEOUT_MS = 20000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initCompleteRef = useRef(false);

  /* ────────────────────────────────────────────── */
  /* Helpers                                        */
  /* ────────────────────────────────────────────── */

  const hasUsedTrial = useMemo(() => {
    return profile?.has_used_trial || localStorage.getItem('hasUsedTrial') === 'true';
  }, [profile]);

  const isTrial = useMemo(() => {
    if (profile?.is_trial && profile.trial_expires_at) {
      return new Date(profile.trial_expires_at) > new Date();
    }

    const localTrial = localStorage.getItem('isTrial');
    const expiry = localStorage.getItem('trialExpiry');

    return localTrial === 'true' && !!expiry && new Date(expiry) > new Date();
  }, [profile]);

  const trialDaysRemaining = useMemo(() => {
    const expiry = profile?.trial_expires_at || localStorage.getItem('trialExpiry');
    if (!expiry) return null;

    const diff = new Date(expiry).getTime() - new Date().getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
  }, [profile]);

  const isPremium = useMemo(() => {
    // Trial NÃO é Premium
    if (isTrial) return false;

    if (profile?.is_premium) {
      if (!profile.premium_expires_at) return true;
      return new Date(profile.premium_expires_at) > new Date();
    }

    const storedPlan = localStorage.getItem('userPlan');
    const expiry = localStorage.getItem('premiumExpiry');

    if (storedPlan === 'premium') {
      if (!expiry || new Date(expiry) > new Date()) return true;
      localStorage.removeItem('userPlan');
      localStorage.removeItem('premiumExpiry');
    }

    return false;
  }, [profile, isTrial]);

  /* ────────────────────────────────────────────── */
  /* Profile                                        */
  /* ────────────────────────────────────────────── */

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setProfile({
          id: userId,
          email: email || '',
          full_name: '',
          avatar_url: '',
          is_premium: false,
          premium_expires_at: null,
          is_trial: false,
          trial_expires_at: null,
          has_used_trial: localStorage.getItem('hasUsedTrial') === 'true',
        });
        return;
      }

      setProfile(data);
    } catch {
      setProfile(null);
    }
  };

  /* ────────────────────────────────────────────── */
  /* Init Auth com Timeout                          */
  /* ────────────────────────────────────────────── */

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
      } catch (e) {
        console.error('fetchProfile error:', e);
        // se der erro no profile, ainda assim libera UI
        setProfile(null);
      } finally {
        if (!didTimeout) finishLoading();
      }
    });
  
    // Timeout de segurança
    timeoutId = setTimeout(() => {
      didTimeout = true;
      console.warn('Auth timeout: Supabase não respondeu a tempo. Continuando sem autenticação.');
      finishLoading();
    }, AUTH_TIMEOUT_MS);
  
    // Carrega sessão inicial
    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (!isMounted) return;
  
        if (didTimeout) {
          // UI já liberou; mas se veio sessão depois, ainda atualiza estado
          if (!error && data?.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            try {
              await fetchProfile(data.session.user.id, data.session.user.email);
            } catch (e) {
              console.error('fetchProfile after timeout failed:', e);
            }
          }
          return;
        }
  
        if (timeoutId) clearTimeout(timeoutId);
  
        if (error) {
          console.error('Erro ao obter sessão:', error);
          setSession(null);
          setUser(null);
          setProfile(null);
          finishLoading();
          return;
        }
  
        const initialSession = data?.session ?? null;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
  
        try {
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id, initialSession.user.email);
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error('fetchProfile failed:', e);
          setProfile(null);
        } finally {
          finishLoading();
        }
      })
      .catch((e) => {
        console.error('Erro na autenticação:', e);
        if (!didTimeout && timeoutId) clearTimeout(timeoutId);
        setSession(null);
        setUser(null);
        setProfile(null);
        finishLoading();
      });
  
    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);
  
  /* ────────────────────────────────────────────── */
  /* Actions                                        */
  /* ────────────────────────────────────────────── */

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

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return { error };
  };

  const startTrial = async () => {
    if (hasUsedTrial) {
      return { success: false, error: 'Trial já utilizado.' };
    }

    const expiry = getTrialExpiryDate().toISOString();
    localStorage.setItem('isTrial', 'true');
    localStorage.setItem('trialExpiry', expiry);

    if (user) {
      await updateProfile({
        is_trial: true,
        trial_expires_at: expiry,
      });
    }

    toast.success('Trial ativado!');
    return { success: true };
  };

  const cancelTrial = async () => {
    localStorage.removeItem('isTrial');
    localStorage.removeItem('trialExpiry');
    localStorage.setItem('hasUsedTrial', 'true');

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

    localStorage.setItem('userPlan', 'premium');
    localStorage.setItem('premiumExpiry', expires.toISOString());
    localStorage.setItem('hasUsedTrial', 'true');

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
