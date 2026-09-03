import React, { memo, useCallback } from 'react'
import { Pressable, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { selectionFeedback } from '@/utils/haptics'

interface ChipProps {
  label: string
  active?: boolean
  onPress: (label: string) => void
  style?: ViewStyle
}

/** Selectable pill used for filter rails and the filter sheet's option groups. */
function ChipBase({ label, active = false, onPress, style }: ChipProps) {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()

  const handlePress = useCallback(() => {
    selectionFeedback()
    onPress(label)
  }, [onPress, label])

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? Colors[colorScheme].tint : theme.secondaryBackground,
          borderColor: active ? Colors[colorScheme].tint : theme.borderColor,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <ThemedText
        style={[styles.label, { color: active ? '#fff' : theme.secondaryFontColor }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  )
}

export const Chip = memo(ChipBase)
Chip.displayName = 'Chip'

export default Chip

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
})
