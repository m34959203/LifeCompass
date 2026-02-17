import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  university?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, university?: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_KEY = 'lifecompass_auth';
const USERS_KEY = 'lifecompass_users';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

interface StoredUser {
  name: string;
  email: string;
  password: string;
  university?: string;
}

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      // Sync with profile storage
      localStorage.setItem('lifecompass_profile', JSON.stringify({
        name: user.name,
        email: user.email,
        university: user.university || '',
      }));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = (email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'Неверный email или пароль' };
    }
    setUser({ name: found.name, email: found.email, university: found.university });
    return { success: true };
  };

  const register = (name: string, email: string, password: string, university?: string) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Пользователь с таким email уже зарегистрирован' };
    }
    const newUser: StoredUser = { name, email, password, university };
    saveUsers([...users, newUser]);
    setUser({ name, email, university });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
