import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// --- Types ---
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  university?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, university?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'university'>>) => void;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  university?: string;
  createdAt: string;
}

const AUTH_KEY = 'lifecompass_auth';
const USERS_KEY = 'lifecompass_users';

// --- Crypto helpers (Web Crypto API) ---
const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

const generateId = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  // PBKDF2-like: multiple rounds of SHA-256
  let hash = data;
  for (let i = 0; i < 1000; i++) {
    hash = new Uint8Array(await crypto.subtle.digest('SHA-256', hash));
  }
  return Array.from(hash, b => b.toString(16).padStart(2, '0')).join('');
};

// --- Storage helpers ---
const getUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// --- Context ---
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verify user still exists in DB
        const users = getUsers();
        if (users.find(u => u.id === parsed.id)) {
          setUser(parsed);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
    setLoading(false);
  }, []);

  // Persist session changes
  useEffect(() => {
    if (loading) return;
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user, loading]);

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, error: 'Неверный email или пароль' };
    }

    const hash = await hashPassword(password, found.salt);
    if (hash !== found.passwordHash) {
      return { success: false, error: 'Неверный email или пароль' };
    }

    const authUser: AuthUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      university: found.university,
    };
    setUser(authUser);
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, university?: string) => {
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Пользователь с таким email уже зарегистрирован' };
    }

    const id = generateId();
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const newUser: StoredUser = {
      id,
      name,
      email: email.toLowerCase(),
      passwordHash,
      salt,
      university,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);

    const authUser: AuthUser = { id, name, email: email.toLowerCase(), university };
    setUser(authUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<AuthUser, 'name' | 'university'>>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };

      // Also update in users DB
      const users = getUsers();
      const idx = users.findIndex(u => u.id === prev.id);
      if (idx !== -1) {
        if (updates.name) users[idx].name = updates.name;
        if (updates.university !== undefined) users[idx].university = updates.university;
        saveUsers(users);
      }

      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
