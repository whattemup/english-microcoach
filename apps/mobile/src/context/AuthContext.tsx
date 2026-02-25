import React, { createContext, useContext, useMemo, useState } from 'react';

interface AuthValue {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      setTokens: (a: string, r: string) => {
        setAccessToken(a);
        setRefreshToken(r);
      },
      logout: () => {
        setAccessToken(null);
        setRefreshToken(null);
      }
    }),
    [accessToken, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext no disponible');
  return context;
};
