import { Platform } from 'react-native'
import * as Haptics from 'expo-haptics'

/**
 * Haptics are a no-op on web and should never break an interaction, so every
 * call is fire-and-forget with the rejection swallowed.
 */
const enabled = Platform.OS === 'ios' || Platform.OS === 'android'

export const tapFeedback = () => {
  if (!enabled) return
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

export const selectionFeedback = () => {
  if (!enabled) return
  Haptics.selectionAsync().catch(() => {})
}

export const successFeedback = () => {
  if (!enabled) return
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
}
