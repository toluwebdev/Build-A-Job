import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { LoginCredentials, RegisterData, User } from '../types';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  /** Reserved for when you load persisted session or call your API. */
  initialize: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function buildUser(partial: {
  email: string;
  firstName: string;
  lastName: string;
  type: User['type'];
}): User {
  const now = new Date().toISOString();
  return {
    id: 'local-user',
    email: partial.email,
    firstName: partial.firstName,
    lastName: partial.lastName,
    type: partial.type,
    status: 'ACTIVE',
    emailVerified: false,
    phoneVerified: false,
    onboardingComplete: false,
    onboardingStep: 'WELCOME',
    createdAt: now,
    updatedAt: now,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const localPart = credentials.email.split('@')[0] ?? 'You';
      setUser(
        buildUser({
          email: credentials.email,
          firstName: localPart,
          lastName: '',
          type: credentials.type ?? 'HOMEOWNER',
        })
      );
    } catch {
      setError('Login failed');
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setUser(
        buildUser({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          type: data.type,
        })
      );
    } catch {
      setError('Registration failed');
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const initialize = useCallback(async () => {
    // Wire axios / SecureStore here later if needed.
  }, []);

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
      initialize,
    }),
    [user, isLoading, error, login, register, logout, clearError, initialize]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

/** @deprecated Prefer `useAuth` — kept so existing screens keep working without a wide rename. */
export function useAuthStore(): AuthContextValue {
  return useAuth();
}
