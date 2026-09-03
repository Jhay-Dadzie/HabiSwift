import React, { forwardRef } from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SlidersHorizontal } from 'lucide-react-native'

import { ThemedText } from '@/components/themed-text'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { tapFeedback } from '@/utils/haptics'

interface SearchBarProps {
  value?: string
  onChangeText?: (text: string) => void
  /**
   * When provided the bar becomes a button: the input is disabled and the whole
   * row navigates. This replaces the old `onTouchStart` hack, which fired on
   * every touch (including scroll gestures starting on the bar) and left the
   * keyboard fighting the navigation transition.
   */
  onPress?: () => void
  onFilterPress?: () => void
  onSubmit?: (value: string) => void
  autoFocus?: boolean
  placeholder?: string
  /** Count shown on the filter button's badge; 0 hides it. */
  activeFilterCount?: number
}

const SearchBar = forwardRef<TextInput, SearchBarProps>(
  (
    {
      value = '',
      onChangeText,
      onPress,
      onFilterPress,
      onSubmit,
      autoFocus = false,
      placeholder = 'Search city, area, or house type',
      activeFilterCount = 0,
    },
    ref
  ) => {
    const theme = usePageThemeRender()
    const colorScheme = useColorScheme()
    const isButton = Boolean(onPress)

    const handlePress = () => {
      if (!isButton) return
      tapFeedback()
      onPress?.()
    }

    const field = isButton ? (
      // Button mode renders text, not an input — nothing to focus, nothing to
      // steal the keyboard while the next screen animates in.
      <ThemedText
        numberOfLines={1}
        style={[styles.input, styles.buttonText, { color: theme.fontColor }]}
      >
        {value || placeholder}
      </ThemedText>
    ) : (
      <TextInput
        ref={ref}
        style={[styles.input, { color: theme.oppositeTextColor }]}
        placeholder={placeholder}
        placeholderTextColor={theme.fontColor}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel="Search listings"
      />
    )

    const content = (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.secondaryBackground,
            borderColor: theme.borderColor,
          },
        ]}
      >
        <Ionicons name="search" size={20} color={theme.icon} />

        {field}

        {!isButton && value.length > 0 && (
          <Pressable
            onPress={() => onChangeText?.('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={18} color={theme.icon} />
          </Pressable>
        )}

        {onFilterPress && (
          <Pressable
            onPress={() => {
              tapFeedback()
              onFilterPress()
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              activeFilterCount
                ? `Filters, ${activeFilterCount} active`
                : 'Open filters'
            }
            style={styles.filterButton}
          >
            <SlidersHorizontal
              size={20}
              color={activeFilterCount ? Colors[colorScheme].tint : theme.icon}
            />
            {activeFilterCount > 0 && (
              <View
                style={[styles.badge, { backgroundColor: Colors[colorScheme].tint }]}
              >
                <ThemedText style={styles.badgeText}>{activeFilterCount}</ThemedText>
              </View>
            )}
          </Pressable>
        )}
      </View>
    )

    if (!isButton) return content

    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="search"
        accessibilityLabel="Search listings"
      >
        {content}
      </Pressable>
    )
  }
)

SearchBar.displayName = 'SearchBar'

export default SearchBar

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  buttonText: {
    lineHeight: 20,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
})
