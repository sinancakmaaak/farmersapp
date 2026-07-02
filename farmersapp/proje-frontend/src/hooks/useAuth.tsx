import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types/index';
import { login as loginApi, getCurrentUser } from '../services/authService';
import LoadingOverlay from '../components/LoadingOverlay';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Failed to load user data:', error);
      // If we can't get user data, clear the auth state
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await loadUserData();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    try {
      const response = await loginApi(phoneNumber, password);
      
      // Store the token
      localStorage.setItem('token', response.token);
      
      // Set the user data
      if (response.user) {
        setUser(response.user);
      } else {
        // If user data is not in response, fetch it
        await loadUserData();
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  if (isLoading) {
    return <LoadingOverlay isVisible={true} message="Yükleniyor..." />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
