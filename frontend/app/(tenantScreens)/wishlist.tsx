import React, { useCallback, useMemo, useState } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'

import { ThemedText } from '@/components/themed-text'
import EmptyState from '@/components/emptyState'
import { ListingCard, ROW_ITEM_HEIGHT } from '@/components/listing/listingCard'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useWishlist, useWishlistActions } from '@/contexts/WishlistContext'
import { Listing, SortKey } from '@/types/listing'
import { getListingsByIds } from '@/utils/listings'
import { Chip } from '@/components/chip'
import { tapFeedback } from '@/utils/haptics'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recently saved' },
  { key: 'price-asc', label: 'Cheapest' },
  { key: 'rating', label: 'Top rated' },
  { key: 'nearest', label: 'Nearest' },
]

export default function Wishlist() {
  const theme = usePageThemeRender()
  const router = useRouter()
  const { ids, hydrated } = useWishlist()
  const { clear } = useWishlistActions()
  const [sort, setSort] = useState<SortKey>('recommended')

  const listings = useMemo(() => {
    // `ids` is stored newest-first, which is exactly "recently saved".
    const saved = getListingsByIds(ids)
    switch (sort) {
      case 'price-asc':
        return [...saved].sort((a, b) => a.monthlyPrice - b.monthlyPrice)
      case 'rating':
        return [...saved].sort((a, b) => b.rating - a.rating)
      case 'nearest':
        return [...saved].sort((a, b) => a.distanceKm - b.distanceKm)
      default:
        return saved
    }
  }, [ids, sort])

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => <ListingCard listing={item} variant="row" />,
    []
  )

  const getItemLayout = useCallback(
    (_: ArrayLike<Listing> | null | undefined, index: number) => ({
      length: ROW_ITEM_HEIGHT,
      offset: ROW_ITEM_HEIGHT * index,
      index,
    }),
    []
  )

  const confirmClear = useCallback(() => {
    tapFeedback()
    Alert.alert(
      'Clear wishlist?',
      `This removes all ${ids.length} saved home${ids.length === 1 ? '' : 's'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clear },
      ]
    )
  }, [ids.length, clear])

  // Avoid flashing the empty state while the saved ids load from storage.
  if (!hydrated) {
    return <View style={[styles.screen, { backgroundColor: theme.background }]} />
  }

  if (listings.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <EmptyState
          title="No saved homes yet"
          subtitle="Tap the heart on any listing and it will show up here — even after you close the app."
          actionLabel="Browse homes"
          onAction={() => router.push('/(tenantScreens)')}
        />
      </View>
    )
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={11}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <ThemedText style={[styles.count, { color: theme.oppositeTextColor }]}>
                {listings.length} saved home{listings.length === 1 ? '' : 's'}
              </ThemedText>
              <Pressable onPress={confirmClear} hitSlop={8}>
                <ThemedText style={[styles.clear, { color: theme.danger }]}>
                  Clear all
                </ThemedText>
              </Pressable>
            </View>
            <View style={styles.sortRow}>
              {SORTS.map((option) => (
                <Chip
                  key={option.key}
                  label={option.label}
                  active={sort === option.key}
                  onPress={() => setSort(option.key)}
                />
              ))}
            </View>
          </View>
        }
      />
    </View>
  )
}

const Separator = () => <View style={{ height: 14 }} />

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexGrow: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
  },
  clear: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
})
