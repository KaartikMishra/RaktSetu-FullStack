import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

const API_BASE = '/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
  token: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  location?: string;
  role?: string;
  googleAuth?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on mount and fetch user data
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bloodbank_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
              setUser(mapApiUserToLocalUser(data.data.user));
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('bloodbank_token');
              setToken(null);
            }
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('bloodbank_token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth init error:', error);
          localStorage.removeItem('bloodbank_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Map API user to local User type
  const mapApiUserToLocalUser = (apiUser: any): User => {
    return {
      id: apiUser.id || apiUser._id,
      name: apiUser.name,
      email: apiUser.email,
      phone: apiUser.phone,
      role: apiUser.role,
      verified: apiUser.verified,
      profilePicture: apiUser.profilePicture,
      createdAt: apiUser.createdAt,
      profile: apiUser.profile
    };
  };

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { user: apiUser, token: newToken } = data.data;

        // Store token
        localStorage.setItem('bloodbank_token', newToken);
        setToken(newToken);

        // Set user
        setUser(mapApiUserToLocalUser(apiUser));

        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      // Handle Google authentication separately (mock for now)
      if (userData.googleAuth) {
        // For Google auth, we still use the regular register endpoint
        // In a real app, you'd have a separate Google OAuth flow
      }

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          location: userData.location,
          role: userData.role || 'seeker'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bloodbank_token');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...userData };
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, loading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
