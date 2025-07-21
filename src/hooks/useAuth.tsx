import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Special handling for admin user - auto-register if not exists
    if (email === 'emzywoo89@gmail.com') {
      try {
        // First try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // Admin doesn't exist, create admin account
          toast({
            title: "Creating admin account...",
            description: "Setting up your admin access.",
          });

          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                first_name: 'Admin',
                last_name: 'User',
              }
            }
          });

          if (signUpError) {
            toast({
              title: "Error creating admin account",
              description: signUpError.message,
              variant: "destructive"
            });
            return { error: signUpError };
          }

          // Now try to sign in again
          const { error: finalSignInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (finalSignInError) {
            toast({
              title: "Error signing in",
              description: finalSignInError.message,
              variant: "destructive"
            });
            return { error: finalSignInError };
          }

          toast({
            title: "Admin account created!",
            description: "Welcome to GreenHost Admin Panel.",
          });
          return { error: null };
        } else if (signInError) {
          toast({
            title: "Error signing in",
            description: signInError.message,
            variant: "destructive"
          });
          return { error: signInError };
        }

        toast({
          title: "Welcome back, Admin!",
          description: "You have successfully signed in.",
        });
        return { error: null };
      } catch (error: any) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }
    }

    // Regular user sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }

    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created!",
        description: "Welcome to GreenHost! You can now sign in.",
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};