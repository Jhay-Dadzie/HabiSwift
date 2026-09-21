import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth, homeRouteFor } from '@/contexts/AuthContext'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'

export default function Index() {
  const { user, hydrated } = useAuth()
  const theme = usePageThemeRender()

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.link} />
      </View>
    )
  }

  return <Redirect href={user ? homeRouteFor(user.role) : '/(onboarding)'} />
}
