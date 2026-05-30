import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toUser, type DbProfile } from '../lib/community';

export type UserRole = 'student' | 'counsellor' | 'admin';
export type VisibilityType = 'anonymous' | 'pseudonym' | 'identified';

export interface User {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
  visibility: VisibilityType;
  pseudonym: string | null;
  is_verified_counsellor: boolean;
  counsellor_title: string | null;
  counsellor_bio: string | null;
  is_frozen: boolean;
  freeze_reason: string | null;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: UserRole,
    options?: {
      visibility?: VisibilityType;
      pseudonym?: string;
      displayName?: string;
      counsellorTitle?: string;
      counsellorBio?: string;
    }
  ) => Promise<{ signedIn: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getFriendlyAuthError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toLowerCase();

  if (normalized.includes('user already registered')) {
    return 'This email is already registered. Log in instead, or use password reset if you forgot your password.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Please verify your email before logging in.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (normalized.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  return message || fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const enforceVerifiedCounsellor = async (profile: DbProfile) => {
    if (profile.role === 'counsellor' && !profile.is_verified_counsellor) {
      await supabase.auth.signOut();
      setUser(null);
      return false;
    }

    return true;
  };

  const syncUserProfile = async (sessionUser: { id: string } | null) => {
    if (!sessionUser) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single<DbProfile>();

    if (profile) {
      const canAccess = await enforceVerifiedCounsellor(profile);
      if (canAccess) {
        setUser(toUser(profile));
      }
    }

    setIsAuthLoading(false);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;

      if (!sessionUser) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

        void syncUserProfile(sessionUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error, 'Login failed. Please try again.'));
    }

    const signedInUser = data.user;

    if (!signedInUser) {
      throw new Error('Login failed. No user session returned.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signedInUser.id)
      .single<DbProfile>();

    if (profileError || !profile) {
      throw new Error('Your account profile is missing. Contact support.');
    }

    const canAccess = await enforceVerifiedCounsellor(profile);
    if (!canAccess) {
      throw new Error('Your counsellor account is still under review.');
    }

    setUser(toUser(profile));
  };

  const register = async (
    email: string,
    password: string,
    role: UserRole,
    options?: {
      visibility?: VisibilityType;
      pseudonym?: string;
      displayName?: string;
      counsellorTitle?: string;
      counsellorBio?: string;
    }
  ) => {
    const visibility = options?.visibility ?? 'anonymous';
    const profileVisibility = role === 'counsellor' ? 'identified' : visibility;
    const authRedirectTo = (import.meta as ImportMeta & {
      env?: {
        VITE_SUPABASE_REDIRECT_URL?: string;
      };
    }).env?.VITE_SUPABASE_REDIRECT_URL?.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...(authRedirectTo ? { emailRedirectTo: authRedirectTo } : {}),
        data: {
          role,
          visibility: profileVisibility,
          display_name: role === 'counsellor' ? (options?.displayName || email.split('@')[0]) : options?.displayName || null,
          pseudonym: role === 'student' ? options?.pseudonym || null : null,
          counsellor_title: role === 'counsellor' ? options?.counsellorTitle || null : null,
          counsellor_bio: role === 'counsellor' ? options?.counsellorBio || null : null,
        },
      },
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error, 'Registration failed. Please try again.'));
    }

    const createdUser = data.user;

    if (!createdUser) {
      throw new Error('Registration failed. No user returned.');
    }

    if (!data.session) {
      setUser(null);
      return { signedIn: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', createdUser.id)
      .single<DbProfile>();

    if (profileError || !profile) {
      throw new Error(profileError?.message || 'Could not load your profile after signup.');
    }

    if (profile.role === 'counsellor' && !profile.is_verified_counsellor) {
      await supabase.auth.signOut();
      setUser(null);
      return { signedIn: false };
    }

    setUser(toUser(profile));
    return { signedIn: Boolean(data.session) };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    const payload: Partial<DbProfile> = {
      display_name: updates.display_name,
      avatar_url: updates.avatar_url,
      visibility: updates.visibility,
      pseudonym: updates.pseudonym,
      counsellor_title: updates.counsellor_title,
      counsellor_bio: updates.counsellor_bio,
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select('*')
      .single<DbProfile>();

    if (error || !profile) {
      throw new Error(error?.message || 'Failed to update profile.');
    }

    setUser(toUser(profile));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
