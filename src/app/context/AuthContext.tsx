import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, visibility?: VisibilityType, pseudonym?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('mindspace_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in real app this would call Supabase
    const mockUsers = JSON.parse(localStorage.getItem('mindspace_mock_users') || '[]');
    const foundUser = mockUsers.find((u: User) => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('mindspace_user', JSON.stringify(foundUser));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const register = async (
    email: string, 
    password: string, 
    role: UserRole, 
    visibility: VisibilityType = 'anonymous',
    pseudonym?: string
  ) => {
    // Mock registration
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      role,
      display_name: role === 'counsellor' ? email.split('@')[0] : null,
      avatar_url: null,
      is_anonymous: role === 'student' && visibility === 'anonymous',
      visibility: role === 'counsellor' ? 'identified' : visibility,
      pseudonym: pseudonym || null,
      is_verified_counsellor: role === 'counsellor',
      counsellor_title: role === 'counsellor' ? 'Licensed Counsellor' : null,
      counsellor_bio: role === 'counsellor' ? 'KNUST Counselling Unit' : null,
      is_frozen: false,
      freeze_reason: null,
    };

    // Store in mock database
    const mockUsers = JSON.parse(localStorage.getItem('mindspace_mock_users') || '[]');
    mockUsers.push(newUser);
    localStorage.setItem('mindspace_mock_users', JSON.stringify(mockUsers));

    setUser(newUser);
    localStorage.setItem('mindspace_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mindspace_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('mindspace_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
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
