import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  InteractionManager,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { ThemedText } from '@/components/themed-text'
import SearchBar from '@/components/searchBar'
import { Chip } from '@/components/chip'
import FilterSheet from '@/components/filterSheet'
import EmptyState from '@/components/emptyState'
import { ListingCard, ROW_ITEM_HEIGHT } from '@/components/listing/listingCard'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useFilters } from '@/contexts/FiltersContext'
import { HOUSE_TYPES, HouseType, Listing } from '@/types/listing'
import { ALL_LISTINGS, applyFilters, countActiveFilters } from '@/utils/listings'
import { tapFeedback } from '@/utils/haptics'

const QUICK_FILTERS = ['All', ...HOUSE_TYPES] as const

export default function Search() {
  const theme = usePageThemeRender()
  const { focus } = useLocalSearchParams<{ focus?: string }>()
  const {
    filters,
    setFilters,
    resetFilters,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useFilters()

  const inputRef = useRef<TextInput>(null)
  const listRef = useRef<FlatList<Listing>>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // The TextInput is driven by local state so typing never waits on the
  // 450-item filter pass; the debounced value is what actually filters.
  const [input, setInput] = useState(filters.query)
  const debouncedQuery = useDebouncedValue(input, 250)

  useEffect(() => {
    if (debouncedQuery !== filters.query) setFilters({ query: debouncedQuery })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  // Only raise the keyboard when the user arrived via the home search bar, and
  // only once the navigation animation has settled — focusing mid-transition
  // makes the push stutter.
  useEffect(() => {
    if (focus !== '1') return
    const task = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus()
    })
    return () => task.cancel()
  }, [focus])

  const results = useMemo(
    () => applyFilters(ALL_LISTINGS, { ...filters, query: debouncedQuery }),
    [filters, debouncedQuery]
  )

  // Jump back to the top whenever the result set changes underneath the user.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }, [results])

  const activeFilterCount = countActiveFilters(filters)
  const activeType = filters.types.length === 1 ? filters.types[0] : 'All'

  const onQuickFilter = useCallback(
    (label: string) =>
      setFilters({ types: label === 'All' ? [] : [label as HouseType] }),
    [setFilters]
  )

  const onSubmit = useCallback(
    (value: string) => {
      addRecentSearch(value)
      Keyboard.dismiss()
    },
    [addRecentSearch]
  )

  const applyRecentSearch = useCallback((term: string) => {
    tapFeedback()
    setInput(term)
    Keyboard.dismiss()
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => <ListingCard listing={item} variant="row" />,
    []
  )

  const keyExtractor = useCallback((item: Listing) => item.id, [])

  // Rows are a fixed height, so the list can lay out without measuring.
  const getItemLayout = useCallback(
    (_: ArrayLike<Listing> | null | undefined, index: number) => ({
      length: ROW_ITEM_HEIGHT,
      offset: ROW_ITEM_HEIGHT * index,
      index,
    }),
    []
  )

  const showRecent = input.trim().length === 0 && recentSearches.length > 0

  /**
   * Passed as an element rather than a component so React keeps the same
   * instance across renders — a `() => <View/>` here would remount the header
   * on every keystroke.
   */
  const header = (
    <View style={styles.header}>
      {showRecent && (
        <View style={styles.recentBlock}>
          <View style={styles.recentHeader}>
            <ThemedText style={[styles.sectionLabel, { color: theme.oppositeTextColor }]}>
              Recent searches
            </ThemedText>
            <Pressable onPress={clearRecentSearches} hitSlop={8}>
              <ThemedText style={[styles.clearText, { color: theme.link }]}>
                Clear
              </ThemedText>
            </Pressable>
          </View>
          <View style={styles.recentWrap}>
            {recentSearches.map((term) => (
              <View
                key={term}
                style={[
                  styles.recentPill,
                  {
                    backgroundColor: theme.secondaryBackground,
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Pressable onPress={() => applyRecentSearch(term)} hitSlop={6}>
                  <ThemedText
                    style={[styles.recentText, { color: theme.secondaryFontColor }]}
                  >
                    {term}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => removeRecentSearch(term)}
                  hitSlop={8}
                  accessibilityLabel={`Remove ${term} from recent searches`}
                >
                  <Ionicons name="close" size={14} color={theme.icon} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        {QUICK_FILTERS.map((label) => (
          <Chip
            key={label}
            label={label}
            active={activeType === label}
            onPress={onQuickFilter}
          />
        ))}
      </ScrollView>

      <View style={styles.resultRow}>
        <ThemedText style={[styles.resultCount, { color: theme.oppositeTextColor }]}>
          {results.length} home{results.length === 1 ? '' : 's'} found
        </ThemedText>
        {activeFilterCount > 0 && (
          <Pressable onPress={resetFilters} hitSlop={8}>
            <ThemedText style={[styles.clearText, { color: theme.link }]}>
              Clear filters
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      {/* Kept outside the list so it never remounts and never loses focus. */}
      <View style={styles.searchWrapper}>
        <SearchBar
          ref={inputRef}
          value={input}
          onChangeText={setInput}
          onSubmit={onSubmit}
          onFilterPress={() => {
            Keyboard.dismiss()
            setFilterSheetOpen(true)
          }}
          activeFilterCount={activeFilterCount}
        />
      </View>

      <FlatList
        ref={listRef}
        data={results}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        // ── Virtualisation budget for a 450-item catalogue ──────────────
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={11}
        // `removeClippedSubviews` is deliberately off: `windowSize` already
        // caps how many rows stay mounted, and clipping is a known source of
        // blank cells on Android when the list has a rich header like this one.
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <EmptyState
            title="No homes match your search"
            subtitle="Try widening your price range or clearing a filter."
            actionLabel={activeFilterCount ? 'Clear filters' : undefined}
            onAction={activeFilterCount ? resetFilters : undefined}
          />
        }
      />

      <FilterSheet visible={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} />
    </SafeAreaView>
  )
}

/** Hoisted so the list does not get a new separator type on every render. */
const Separator = () => <View style={{ height: 14 }} />

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchWrapper: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  header: {
    gap: 4,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  recentBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  recentText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
})
