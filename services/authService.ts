import { useDataSource } from '@/contexts/DataSourceContext';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username?: string;
}

export async function login(
  credentials: LoginRequest,
  apiUrl: string = 'http://localhost:8080'
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro ao fazer login: ${response.status}`);
    }

    const data = await response.json();
    return {
      token: data.token || data,
      username: credentials.username,
    };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    throw new Error(error.message || 'Erro desconhecido ao fazer login');
  }
}

export async function register(
  userData: RegisterRequest,
  apiUrl: string = 'http://localhost:8080'
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Erro ao registrar usuário: ${response.status}`);
    }

    const data = await response.json();
    
    // Após registrar, fazer login automático
    return await login(
      { username: userData.username, password: userData.password },
      apiUrl
    );
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    throw new Error(error.message || 'Erro desconhecido ao registrar usuário');
  }
}

