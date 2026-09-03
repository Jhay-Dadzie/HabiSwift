import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { CircleUserRound, Heart, House, MessageSquare } from 'lucide-react-native'

import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useWishlist } from '@/contexts/WishlistContext'

export default function TenantLayout() {
  const colorScheme = useColorScheme()
  const theme = usePageThemeRender()
  const { ids } = useWishlist()

  return (
    <Tabs
      screenOptions={{
        // Cross-fades the outgoing tab instead of cutting to the new one.
        animation: 'shift',
        lazy: true,
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: theme.icon,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.borderColor,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
        },
        headerTitleStyle: { color: theme.oppositeTextColor, fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <House size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="search" size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <Heart size={23} color={color} />,
          // Badge reflects real saved state rather than a hardcoded number.
          tabBarBadge: ids.length > 0 ? ids.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors[colorScheme].tint,
            fontSize: 10,
            lineHeight: 14,
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <MessageSquare size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <CircleUserRound size={23} color={color} />,
        }}
      />
    </Tabs>
  )
}
