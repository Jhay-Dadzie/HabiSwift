import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { ThemedText } from '@/components/themed-text'
import { Chip } from '@/components/chip'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useFilters } from '@/contexts/FiltersContext'
import { AMENITIES, Filters, HOUSE_TYPES, HouseType, SortKey } from '@/types/listing'
import {
  ALL_LISTINGS,
  applyFilters,
  CITY_NAMES,
  countActiveFilters,
  SORT_OPTIONS,
} from '@/utils/listings'
import { successFeedback, tapFeedback } from '@/utils/haptics'

/** Monthly GHS bands offered as one-tap presets. */
const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Any', min: null, max: null },
  { label: 'Under 500', min: null, max: 500 },
  { label: '500 – 1,500', min: 500, max: 1500 },
  { label: '1,500 – 3,000', min: 1500, max: 3000 },
  { label: '3,000+', min: 3000, max: null },
]

const COUNT_OPTIONS = [0, 1, 2, 3, 4]
const countLabel = (n: number) => (n === 0 ? 'Any' : n === 4 ? '4+' : String(n))

interface FilterSheetProps {
  visible: boolean
  onClose: () => void
}

/**
 * Bottom sheet for the full filter set.
 *
 * Edits are made against a local `draft` and only committed on "Show homes",
 * so dragging through options never re-filters the list behind the sheet — the
 * result count in the footer previews the outcome instead.
 */
export default function FilterSheet({ visible, onClose }: FilterSheetProps) {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()
  const tint = Colors[colorScheme].tint
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const { filters, replaceFilters } = useFilters()

  const [draft, setDraft] = useState<Filters>(filters)
  // Keeps the modal mounted through the closing animation.
  const [mounted, setMounted] = useState(visible)

  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      setDraft(filters)
      setMounted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  useEffect(() => {
    if (visible && !mounted) return
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 200,
      useNativeDriver: true,
    })
    animation.start(({ finished }) => {
      if (finished && !visible) setMounted(false)
    })
    return () => animation.stop()
  }, [visible, mounted, progress])

  const sheetHeight = Math.min(height * 0.88, height - insets.top - 12)

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight, 0],
  })

  const patch = useCallback(
    (next: Partial<Filters>) => setDraft((prev) => ({ ...prev, ...next })),
    []
  )

  const toggleInArray = useCallback(
    <T extends string>(list: T[], value: T): T[] =>
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    []
  )

  const resultCount = useMemo(
    () => applyFilters(ALL_LISTINGS, draft).length,
    [draft]
  )

  const activeCount = useMemo(() => countActiveFilters(draft), [draft])

  const handleApply = () => {
    successFeedback()
    replaceFilters(draft)
    onClose()
  }

  const handleReset = () => {
    tapFeedback()
    // Reset clears filters but keeps whatever the user typed in the search box.
    setDraft((prev) => ({
      ...prev,
      types: [],
      amenities: [],
      minPrice: null,
      maxPrice: null,
      bedrooms: 0,
      bathrooms: 0,
      city: null,
      furnishedOnly: false,
      sort: 'recommended',
    }))
  }

  /** Numeric text field for a custom price bound. */
  const priceField = (key: 'minPrice' | 'maxPrice', placeholder: string) => (
    <View
      style={[
        styles.priceInputWrapper,
        { borderColor: theme.borderColor, backgroundColor: theme.secondaryBackground },
      ]}
    >
      <ThemedText style={[styles.priceCurrency, { color: theme.secondaryFontColor }]}>
        GHS
      </ThemedText>
      <TextInput
        value={draft[key] === null ? '' : String(draft[key])}
        onChangeText={(text) => {
          const digits = text.replace(/[^0-9]/g, '')
          patch({ [key]: digits === '' ? null : Number(digits) } as Partial<Filters>)
        }}
        keyboardType="number-pad"
        placeholder={placeholder}
        placeholderTextColor={theme.fontColor}
        style={[styles.priceInput, { color: theme.oppositeTextColor }]}
        accessibilityLabel={key === 'minPrice' ? 'Minimum price' : 'Maximum price'}
      />
    </View>
  )

  const section = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: theme.oppositeTextColor }]}>
        {title}
      </ThemedText>
      {children}
    </View>
  )

  if (!mounted) return null

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close filters"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              backgroundColor: theme.background,
              borderColor: theme.borderColor,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.borderColor }]} />

          <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
            <ThemedText style={[styles.headerTitle, { color: theme.oppositeTextColor }]}>
              Filters
            </ThemedText>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close filters">
              <Ionicons name="close" size={24} color={theme.oppositeTextColor} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {section(
              'Sort by',
              <View style={styles.wrap}>
                {SORT_OPTIONS.map((option) => (
                  <Chip
                    key={option.key}
                    label={option.label}
                    active={draft.sort === option.key}
                    onPress={() => patch({ sort: option.key as SortKey })}
                  />
                ))}
              </View>
            )}

            {section(
              'House type',
              <View style={styles.wrap}>
                {HOUSE_TYPES.map((type) => (
                  <Chip
                    key={type}
                    label={type}
                    active={draft.types.includes(type)}
                    onPress={() =>
                      patch({ types: toggleInArray(draft.types, type as HouseType) })
                    }
                  />
                ))}
              </View>
            )}

            {section(
              'City',
              <View style={styles.wrap}>
                <Chip
                  label="All cities"
                  active={draft.city === null}
                  onPress={() => patch({ city: null })}
                />
                {CITY_NAMES.map((city) => (
                  <Chip
                    key={city}
                    label={city}
                    active={draft.city === city}
                    onPress={() => patch({ city })}
                  />
                ))}
              </View>
            )}

            {section(
              'Monthly rent',
              <>
                <View style={styles.wrap}>
                  {PRICE_PRESETS.map((preset) => (
                    <Chip
                      key={preset.label}
                      label={preset.label}
                      active={
                        draft.minPrice === preset.min && draft.maxPrice === preset.max
                      }
                      onPress={() => patch({ minPrice: preset.min, maxPrice: preset.max })}
                    />
                  ))}
                </View>
                <View style={styles.priceRow}>
                  {priceField('minPrice', 'Min')}
                  <ThemedText style={{ color: theme.secondaryFontColor }}>to</ThemedText>
                  {priceField('maxPrice', 'Max')}
                </View>
              </>
            )}

            {section(
              'Bedrooms',
              <View style={styles.wrap}>
                {COUNT_OPTIONS.map((n) => (
                  <Chip
                    key={`bed-${n}`}
                    label={countLabel(n)}
                    active={draft.bedrooms === n}
                    onPress={() => patch({ bedrooms: n })}
                  />
                ))}
              </View>
            )}

            {section(
              'Bathrooms',
              <View style={styles.wrap}>
                {COUNT_OPTIONS.map((n) => (
                  <Chip
                    key={`bath-${n}`}
                    label={countLabel(n)}
                    active={draft.bathrooms === n}
                    onPress={() => patch({ bathrooms: n })}
                  />
                ))}
              </View>
            )}

            {section(
              'Amenities',
              <View style={styles.wrap}>
                {AMENITIES.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    active={draft.amenities.includes(amenity)}
                    onPress={() =>
                      patch({ amenities: toggleInArray(draft.amenities, amenity) })
                    }
                  />
                ))}
              </View>
            )}

            <View style={[styles.switchRow, { borderTopColor: theme.borderColor }]}>
              <View style={styles.switchLabel}>
                <ThemedText
                  style={[styles.sectionTitle, { color: theme.oppositeTextColor }]}
                >
                  Furnished only
                </ThemedText>
                <ThemedText style={{ color: theme.secondaryFontColor, fontSize: 13 }}>
                  Move in without buying furniture
                </ThemedText>
              </View>
              <Switch
                value={draft.furnishedOnly}
                onValueChange={(v) => patch({ furnishedOnly: v })}
                trackColor={{ false: theme.borderColor, true: tint }}
                thumbColor="#fff"
              />
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                borderTopColor: theme.borderColor,
                backgroundColor: theme.background,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <Pressable
              onPress={handleReset}
              disabled={activeCount === 0}
              style={({ pressed }) => [
                styles.resetButton,
                {
                  borderColor: theme.borderColor,
                  opacity: activeCount === 0 ? 0.4 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText
                style={[styles.resetText, { color: theme.oppositeTextColor }]}
              >
                Reset{activeCount ? ` (${activeCount})` : ''}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [
                styles.applyButton,
                { backgroundColor: tint, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <ThemedText style={styles.applyText}>
                {resultCount === 0
                  ? 'No matches'
                  : `Show ${resultCount} home${resultCount === 1 ? '' : 's'}`}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  priceCurrency: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  switchLabel: {
    flex: 1,
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  resetButton: {
    paddingHorizontal: 20,
    height: 52,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
