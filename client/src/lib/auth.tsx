import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('financeUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Verify the user is still valid on the server
        checkUser(userData.id);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('financeUser');
      }
    }
    setIsLoading(false);
  }, []);

  const checkUser = async (userId: number) => {
    try {
      const res = await fetch(`/api/auth/user?userId=${userId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!res.ok) {
        // User not found or invalid, clear localStorage
        setUser(null);
        localStorage.removeItem('financeUser');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        return false;
      }
      
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('financeUser', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        return false;
      }
      
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('financeUser', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financeUser');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper hook to get the user ID
export const useUserId = () => {
  const { user } = useAuth();
  return user?.id || null;
};