import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation"
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Toast from 'react-native-toast-message'

import { toastConfig } from '@/components/toastConfig'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { FiltersProvider } from '@/contexts/FiltersContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Colors } from '@/constants/theme'

function RootLayoutContent() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  // Give the navigator the app's own background so pushes never flash white
  // (or black) between screens.
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: Colors[colorScheme].background,
      card: Colors[colorScheme].background,
      border: Colors[colorScheme].borderColor,
      primary: Colors[colorScheme].tint,
    },
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          // Native stack animations run on the UI thread; 260ms reads as
          // responsive without feeling clipped.
          animationDuration: 260,
          gestureEnabled: true,
          contentStyle: { backgroundColor: Colors[colorScheme].background },
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
        {/* Tab groups cross-fade: sliding a whole tab bar in looks wrong. */}
        <Stack.Screen name="(tenantScreens)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(landlordScreens)" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth" />
        <Stack.Screen name="create-listing" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="listing/[id]"
          options={{
            animation: 'slide_from_bottom',
            // Lets the user swipe the detail sheet away from anywhere.
            gestureDirection: 'vertical',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Toast config={toastConfig} />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CustomThemeProvider>
          <AuthProvider>
            <WishlistProvider>
              <FiltersProvider>
                <RootLayoutContent />
              </FiltersProvider>
            </WishlistProvider>
          </AuthProvider>
        </CustomThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
