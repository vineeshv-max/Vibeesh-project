import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AdminSession {
  username: string;
  loggedInAt: string;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  adminSession: AdminSession | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; error?: string };
}

const SESSION_KEY = 'vibeesh_admin_session';
const CREDS_KEY = 'vibeesh_admin_credentials';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse admin session', e);
    }
    return null;
  });

  const isAdmin = Boolean(adminSession);

  // Sync session changes to localStorage
  useEffect(() => {
    if (adminSession) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminSession));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [adminSession]);

  const getValidCredentials = useCallback((): { username: string; passwords: string[] } => {
    try {
      const custom = localStorage.getItem(CREDS_KEY);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed.username && parsed.password) {
          return {
            username: parsed.username,
            passwords: [parsed.password],
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse custom admin credentials', e);
    }
    // Default system credentials
    return {
      username: 'admin',
      passwords: ['admin', 'vibeesh@admin', 'vibeesh2026'],
    };
  }, []);

  const login = useCallback(
    (username: string, password: string): { success: boolean; error?: string } => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanUser || !cleanPass) {
        return { success: false, error: 'Please enter both username and password.' };
      }

      const valid = getValidCredentials();

      if (cleanUser === valid.username.toLowerCase() && valid.passwords.includes(cleanPass)) {
        const newSession: AdminSession = {
          username: valid.username,
          loggedInAt: new Date().toISOString(),
        };
        setAdminSession(newSession);
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid administrator credentials. Please check your username and password.',
      };
    },
    [getValidCredentials]
  );

  const logout = useCallback(() => {
    setAdminSession(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const changePassword = useCallback(
    (oldPass: string, newPass: string): { success: boolean; error?: string } => {
      const valid = getValidCredentials();
      if (!valid.passwords.includes(oldPass.trim())) {
        return { success: false, error: 'Current password does not match.' };
      }

      if (newPass.trim().length < 4) {
        return { success: false, error: 'New password must be at least 4 characters.' };
      }

      const updated = {
        username: valid.username,
        password: newPass.trim(),
      };
      localStorage.setItem(CREDS_KEY, JSON.stringify(updated));
      return { success: true };
    },
    [getValidCredentials]
  );

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        adminSession,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
