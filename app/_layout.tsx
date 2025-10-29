import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'react-native';

import { DataSourceProvider } from '@/contexts/DataSourceContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/Colors';
import { usePathname, useRouter } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.tint,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.accent,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.card}
      />
      <DataSourceProvider>
        <AuthProvider>
          <AuthGuard>
            <ThemeProvider value={CustomLightTheme}>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: Colors.light.card,
                  },
                  headerTintColor: Colors.light.text,
                  headerTitleStyle: {
                    fontWeight: '700',
                  },
                  headerShadowVisible: true,
                }}
              >
                <Stack.Screen 
                  name="login" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="modal" 
                  options={{ 
                    presentation: 'modal',
                    headerStyle: {
                      backgroundColor: Colors.light.card,
                    },
                  }} 
                />
              </Stack>
            </ThemeProvider>
          </AuthGuard>
        </AuthProvider>
      </DataSourceProvider>
    </GestureHandlerRootView>
  );
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Se não está autenticado e não está na tela de login, redirecionar para login
      if (!isAuthenticated && pathname !== '/login') {
        router.replace('/login');
      }
      // Se está autenticado e está na tela de login, redirecionar para início
      if (isAuthenticated && pathname === '/login') {
        router.replace('/(tabs)/inicio');
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  // Mostrar nada enquanto carrega ou redireciona
  if (isLoading) {
    return null;
  }

  // Se não está autenticado e não está na tela de login, não renderizar nada (aguardar redirecionamento)
  if (!isAuthenticated && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
