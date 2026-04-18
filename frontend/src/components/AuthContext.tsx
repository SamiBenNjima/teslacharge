import React, { createContext, useContext, useEffect, useState } from 'react';

type DriverProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
};

type AuthContextType = {
  token: string | null;
  driver: DriverProfile | null;
  loading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  driver: null,
  loading: true,
  signIn: () => {},
  signOut: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      handleSignIn(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSignIn = async (jwt: string) => {
    setLoading(true);
    setToken(jwt);
    localStorage.setItem('authToken', jwt);
    
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const userId = payload.sub;
      
      // For now, create a basic driver profile from JWT
      // In a real app, you'd fetch from backend
      setDriver({
        id: userId,
        first_name: 'Driver',
        last_name: 'User',
        email: payload.email || 'user@example.com'
      });
    } catch (err) {
      console.error('Error decoding JWT:', err);
      handleSignOut();
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setToken(null);
    setDriver(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ token, driver, loading, signIn: handleSignIn, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
