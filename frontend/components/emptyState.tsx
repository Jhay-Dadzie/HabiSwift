import React from 'react'
import { Image, Pressable, StyleSheet, View, ViewStyle } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'

interface EmptyStateProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
  style?: ViewStyle
}

/** Shared "nothing here" block — every list in the app renders the same one. */
export default function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
  compact = false,
  style,
}: EmptyStateProps) {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <Image
        source={require('@/assets/images/emptyState.png')}
        style={compact ? styles.imageCompact : styles.image}
        resizeMode="contain"
      />
      <ThemedText
        style={[
          compact ? styles.titleCompact : styles.title,
          { color: theme.oppositeTextColor },
        ]}
      >
        {title}
      </ThemedText>
      {subtitle ? (
        <ThemedText style={[styles.subtitle, { color: theme.secondaryFontColor }]}>
          {subtitle}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: Colors[colorScheme].tint, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <ThemedText style={styles.actionText}>{actionLabel}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  compact: {
    paddingVertical: 24,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  imageCompact: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  action: {
    marginTop: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})
