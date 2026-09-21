import React, { useCallback, useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Bell } from 'lucide-react-native'

import { ThemedText } from '@/components/themed-text'
import SearchBar from '@/components/searchBar'
import { Chip } from '@/components/chip'
import FilterSheet from '@/components/filterSheet'
import EmptyState from '@/components/emptyState'
import { CARD_SIZES, CardVariant, ListingCard } from '@/components/listing/listingCard'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useFilters } from '@/contexts/FiltersContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { HOUSE_TYPES, HouseType, Listing, SortKey } from '@/types/listing'
import { AFFORDABLE, countActiveFilters, NEAR_YOU, RECOMMENDED } from '@/utils/listings'
import { tapFeedback } from '@/utils/haptics'

const QUICK_FILTERS = ['All', ...HOUSE_TYPES] as const
const RAIL_GAP = 14

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

interface RailProps {
  title: string
  data: Listing[]
  variant: CardVariant
  onSeeAll: () => void
}

/**
 * Horizontal rail of cards. Horizontal lists nested in the vertical page
 * scroller are fine (different axis), and a fixed item width lets each rail
 * skip layout measurement entirely.
 */
function Rail({ title, data, variant, onSeeAll }: RailProps) {
  const theme = usePageThemeRender()
  const itemWidth = CARD_SIZES[variant === 'row' ? 'large' : variant].width + RAIL_GAP

  const renderItem = useCallback(
    ({ item }: { item: Listing }) => <ListingCard listing={item} variant={variant} />,
    [variant]
  )

  const getItemLayout = useCallback(
    (_: ArrayLike<Listing> | null | undefined, index: number) => ({
      length: itemWidth,
      offset: itemWidth * index,
      index,
    }),
    [itemWidth]
  )

  return (
    <View style={styles.rail}>
      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: theme.oppositeTextColor }]}>
          {title}
        </ThemedText>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <ThemedText style={[styles.seeAll, { color: theme.link }]}>See all</ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
        ListEmptyComponent={
          <EmptyState
            compact
            title="Nothing here yet"
            subtitle="Try a different house type."
            style={styles.railEmpty}
          />
        }
      />
    </View>
  )
}

export default function Home() {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()
  const router = useRouter()
  const { filters, setFilters } = useFilters()
  const { ids: wishlistIds } = useWishlist()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const activeType = filters.types.length === 1 ? filters.types[0] : 'All'
  const activeFilterCount = countActiveFilters(filters)

  const byActiveType = useCallback(
    (list: Listing[]) =>
      filters.types.length ? list.filter((l) => filters.types.includes(l.type)) : list,
    [filters.types]
  )

  const recommended = useMemo(() => byActiveType(RECOMMENDED), [byActiveType])
  const nearYou = useMemo(() => byActiveType(NEAR_YOU), [byActiveType])
  const affordable = useMemo(() => byActiveType(AFFORDABLE), [byActiveType])

  const onQuickFilter = useCallback(
    (label: string) => {
      setFilters({ types: label === 'All' ? [] : [label as HouseType] })
    },
    [setFilters]
  )

  /** "See all" hands the rail's intent to Search as a sort, then navigates. */
  const seeAll = useCallback(
    (sort: SortKey) => {
      tapFeedback()
      setFilters({ sort })
      router.push('/(tenantScreens)/search')
    },
    [router, setFilters]
  )

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
      >
        {/* ── Greeting ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { backgroundColor: Colors[colorScheme].tint }]}>
              <ThemedText style={styles.avatarText}>J</ThemedText>
            </View>
            <View>
              <ThemedText style={[styles.greeting, { color: theme.secondaryFontColor }]}>
                {greeting()}
              </ThemedText>
              <ThemedText style={[styles.userName, { color: theme.oppositeTextColor }]}>
                Joseph
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={tapFeedback}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={({ pressed }) => [
              styles.notifButton,
              {
                backgroundColor: theme.iconContainer,
                borderColor: theme.borderColor,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Bell size={20} color={theme.oppositeTextColor} />
          </Pressable>
        </View>

        {/* ── Sticky search + quick filters ────────────────────────────────── */}
        <View style={[styles.stickyBlock, { backgroundColor: theme.background }]}>
          <SearchBar
            // `focus` tells Search to raise the keyboard; tapping the Search
            // tab directly should not.
            onPress={() =>
              router.push({
                pathname: '/(tenantScreens)/search',
                params: { focus: '1' },
              })
            }
            onFilterPress={() => setFilterSheetOpen(true)}
            activeFilterCount={activeFilterCount}
            value={filters.query}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
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
        </View>

        {/* ── Saved shortcut ───────────────────────────────────────────────── */}
        {wishlistIds.length > 0 && (
          <Pressable
            onPress={() => {
              tapFeedback()
              router.push('/(tenantScreens)/wishlist')
            }}
            style={({ pressed }) => [
              styles.savedBanner,
              {
                backgroundColor: theme.secondaryBackground,
                borderColor: theme.borderColor,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ThemedText style={{ color: theme.oppositeTextColor, fontWeight: '600' }}>
              {wishlistIds.length} saved home{wishlistIds.length === 1 ? '' : 's'}
            </ThemedText>
            <ThemedText style={{ color: theme.link, fontWeight: '600' }}>View</ThemedText>
          </Pressable>
        )}

        {/* ── Rails ────────────────────────────────────────────────────────── */}
        <Rail
          title="Recommended for you"
          data={recommended}
          variant="large"
          onSeeAll={() => seeAll('recommended')}
        />
        <Rail
          title="Near your location"
          data={nearYou}
          variant="compact"
          onSeeAll={() => seeAll('nearest')}
        />
        <Rail
          title="Easy on the budget"
          data={affordable}
          variant="compact"
          onSeeAll={() => seeAll('price-asc')}
        />
      </ScrollView>

      <FilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyBlock: {
    paddingBottom: 4,
  },
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  rail: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 15,
    fontWeight: '600',
  },
  railContent: {
    paddingHorizontal: 16,
    gap: RAIL_GAP,
    paddingBottom: 6,
  },
  railEmpty: {
    width: 260,
  },
})
