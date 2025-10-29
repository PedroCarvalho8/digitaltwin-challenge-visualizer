import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as authLogin, register as authRegister, LoginRequest, RegisterRequest } from '@/services/authService';

interface AuthContextData {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  login: (credentials: LoginRequest, apiUrl?: string) => Promise<void>;
  register: (userData: RegisterRequest, apiUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

const TOKEN_KEY = '@auth:token';
const USERNAME_KEY = '@auth:username';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUsername] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USERNAME_KEY),
      ]);

      if (storedToken && storedUsername) {
        setToken(storedToken);
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error('Erro ao carregar autenticação salva:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuth = async (newToken: string, newUsername: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, newToken),
        AsyncStorage.setItem(USERNAME_KEY, newUsername),
      ]);
      setToken(newToken);
      setUsername(newUsername);
    } catch (error) {
      console.error('Erro ao salvar autenticação:', error);
      throw error;
    }
  };

  const login = async (credentials: LoginRequest, apiUrl: string = 'http://localhost:8080') => {
    try {
      setIsLoading(true);
      const response = await authLogin(credentials, apiUrl);
      await saveAuth(response.token, response.username || credentials.username);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest, apiUrl: string = 'http://localhost:8080') => {
    try {
      setIsLoading(true);
      const response = await authRegister(userData, apiUrl);
      await saveAuth(response.token, response.username || userData.username);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USERNAME_KEY),
      ]);
      setToken(null);
      setUsername(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        username,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

