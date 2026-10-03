'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';
import { ToastProvider } from '@/components/toast-provider';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setIsLoading(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (isMounted) {
        setSession(error ? null : data.session);
        setUser(error ? null : (data.session?.user ?? null));
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }

  async function signOut() {
    const { error } = await getSupabaseClient().auth.signOut();

    if (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      <ToastProvider>{children}</ToastProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}