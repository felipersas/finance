import { SignInData } from '@/validators/auth/sign-in';
import { useStorageState } from '@/hooks/useStorageState';
import { api } from '@/services/api';
import { ApiResponse } from '@/types/api-response';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  ReactNode,
  useContext,
} from 'react';
import { handleApiError } from '@/utils/functions/request-handler';
import { showToast } from '@/utils/toast';
import { SignUpData } from '@/validators/auth/sign-up';


interface SessionData {
  token: string;
  name: string;
}

interface AuthContextType {
  session: SessionData | null;
  isLoading: boolean;
  signIn: (signInData: SignInData) => Promise<void>;
  signUp: (signUpData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [[isLoading, session], setSession] = useStorageState('session');

  const signIn = async (signInData: SignInData) => {
    try {
      const response = await api.post<ApiResponse<SessionData>>('/auth/signin', {
        email: signInData.email,
        password: signInData.password
      });

      const { data } = response.data;

      if (response.data.success && data) {
        const sessionData: SessionData = { token: data.token, name: data.name };
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('user', data.name);
        setSession(JSON.stringify(sessionData));
        showToast('success', 'Success!', response.data.message || 'You have successfully signed in.');
      } else {
        showToast('error', 'Login inválido', response.data.message || 'E-mail ou senha incorretos.');
      }
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const signUp = async (signUpData: SignUpData) => {
    try {
      const response = await api.post<ApiResponse<SessionData>>('/auth/signup', {
        name: signUpData.name,
        email: signUpData.email,
        password: signUpData.password
      });


      const { data } = response.data;

      if (response.data.success && data) {
        const sessionData: SessionData = { token: data.token, name: data.name };
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('user', data.name);
        setSession(JSON.stringify(sessionData));
        showToast('success', 'Success!', response.data.message || 'You have successfully signed up.');
      } else {
        showToast('error', 'Sign Up Failed', response.data.message || 'Unable to create account with provided details.');
      }
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    setSession(null);
  };

  // Parse session string to object

  let parsedSession: SessionData | null = null;

  try {
    parsedSession = session ? JSON.parse(session) : null;
  } catch (error) {
    console.warn('Erro ao fazer parse da sessão:', error);
    parsedSession = null;
  }

  return (
    <AuthContext.Provider value={{ session: parsedSession, signIn, signOut, isLoading, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSession = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
};