import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import PacienteListItem from '@/models/PacienteListItem';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ActionSheetProvider>
        <>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Início' }} />
            <Stack.Screen name="usuario/index" options={({ title: 'Novo paciente' })} />
            <Stack.Screen
              name="usuario/[slug]"
              options={({route}) => {
                const slug = String((route.params as any)?.slug ?? '')
                const paciente = PacienteListItem.fromSlug(slug)
                return { title: paciente?.nome ?? 'Não identificado' }
              }}
            />
            <Stack.Screen name="+not-found" options={{ headerShown: false }}/>
          </Stack>
          <StatusBar style="auto" />
        </>
      </ActionSheetProvider>
    </ThemeProvider>
  );
}
