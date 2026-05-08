import { FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useRouter } from 'expo-router'
import SearchBar from '@/components/searchBar'
import React, { useRef, useEffect, useState, useMemo, useCallback, memo } from 'react'
import mockData from '@/assets/data/mock_data.json'
import { CardStyles } from '@/components/globalStyles/cardStyles'
import { PageStyles } from '@/components/globalStyles/pageStyles'
import { BedDouble, MapPin, Star } from 'lucide-react-native'

interface Listing {
  id: string
  type: string
  price: number
  currency: string
  time: string
  bedrooms: number
  bathrooms: number
  location: string
  amenities: string[]
  image: string[]
  rating: number
}

// ─── Filter chips ─────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Price', 'Location', 'Apartment', 'Chamber and Hall', 'Single Room', 'Self-Contained']

// ─── Derive sections from mock data ──────────────────────────────────────────
const allListings: Listing[] = mockData as Listing[]

/** Recommended: highest-rated listings (top 10) */
const recommended = [...allListings]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 10)

/** Near you: variety of types (top 10 by rating after recommended) */
const nearYou = [...allListings]
  .sort((a, b) => b.rating - a.rating)
  .slice(10, 20)

// ─── Optimized Listing Card Component - Memoized ──────────────────────────────
interface ListingCardProps {
  item: Listing
  colorScheme: string
  colorThemeRenderer: any
}

const ListingCard = memo(({ item, colorScheme, colorThemeRenderer }: ListingCardProps) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => null}
      style={{ marginBottom: 16 }}
    >
      <ThemedView
        style={[
          CardStyles.listCard,
          {
            borderColor: colorThemeRenderer.borderColor,
          },
        ]}
      >
        {/* Left side: Image */}
        <Image
          source={{ uri: item.image[0] }}
          style={CardStyles.listImage}
          resizeMode="cover"
        />

        {/* Right side: Content */}
        <ThemedView style={CardStyles.listCardColumn}>
          {/* Price*/}
          <ThemedText type='price'
            style={{
              color: colorThemeRenderer.oppositeTextColor,
            }}
          >
            {item.currency} {item.price.toLocaleString()}
            <ThemedText style={{ fontSize: 14, fontWeight: '400' }}>
              /{item.time}
            </ThemedText>
          </ThemedText>

          {/* Type*/}
          <ThemedText type='defaultSemiBold'
            style={{
              color: colorThemeRenderer.secondaryFontColor,
            }}
          >
            {item.type}
          </ThemedText>
            

          {/* Location */}
          <ThemedView style={CardStyles.cardDetailsRowWithIcon}>
            <MapPin size={16} color={'green'}/>
            <ThemedText
              style={CardStyles.cardLocation}
              numberOfLines={1}
            >
              {item.location}
            </ThemedText>
          </ThemedView>

          {/* Bedrooms and Rating */}
          <ThemedView style={CardStyles.bedRoomAndRating}>

            {/*Bedroom */}
            <ThemedView style={CardStyles.cardDetailsRowWithIcon}>
              <BedDouble size={16} color={Colors[(colorScheme as 'light' | 'dark') ?? 'light'].tint}/>
              <ThemedText
                style={[CardStyles.cardLocation, {color: colorThemeRenderer.secondaryFontColor}]}
              >
                {item.bedrooms} Bedroom{item.bedrooms !== 1 ? 's' : ''}
              </ThemedText>

            </ThemedView>

            {/*Rating */}
            <ThemedView
              style={CardStyles.cardDetailsRowWithIcon}
            >
              <Star color={'#EAB308'} size={14} strokeWidth={2.5}/>
              <ThemedText
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colorThemeRenderer.oppositeTextColor,
                }}
              >
                {item.rating.toFixed(1)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  )
})

ListingCard.displayName = 'ListingCard'

// ─── Optimized Filter Chip Component - Memoized ──────────────────────────────
interface FilterChipProps {
  label: string
  isActive: boolean
  onPress: () => void
  colorScheme?: keyof typeof Colors
  colorThemeRenderer: any
}

const FilterChip = memo(({ label, isActive, onPress, colorScheme, colorThemeRenderer }: FilterChipProps) => {
  return (
    <TouchableOpacity
      key={label}
      style={[
        PageStyles.filters,
        isActive
          ? { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          : { backgroundColor: colorThemeRenderer.secondaryBackground },
        {
          borderColor: colorThemeRenderer.borderColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <ThemedText
        style={[
          PageStyles.filtersText,
          isActive
            ? { color: '#fff' }
            : { color: colorThemeRenderer.secondaryFontColor },
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  )
})

FilterChip.displayName = 'FilterChip'

// ─── Main Search Component ────────────────────────────────────────────────────
export default function Search() {
  const searchInputRef = useRef<TextInput>(null)
  const [searchValue, setSearchValue] = useState('')
  const colorScheme = useColorScheme()
  const colorThemeRenderer = usePageThemeRender()
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // ─── Filter listings based on active filter and search value ────────────────
  // Memoized to prevent recalculation on every render
  const filteredListings = useMemo(() => {
    let filtered = [...allListings]

    // Filter by type if not 'All', 'Price', or 'Location'
    if (activeFilter !== 'All' && activeFilter !== 'Price' && activeFilter !== 'Location') {
      filtered = filtered.filter(item => item.type === activeFilter)
    }

    // Filter by search value (location or type)
    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase()
      filtered = filtered.filter(
        item =>
          item.location.toLowerCase().includes(lowerSearch) ||
          item.type.toLowerCase().includes(lowerSearch)
      )
    }

    return filtered
  }, [activeFilter, searchValue])

  // ─── Memoized render function for FlatList ────────────────────────────────────
  const renderListingCard = useCallback(
    ({ item }: { item: Listing }) => (
      <ListingCard 
        item={item} 
        colorScheme={colorScheme ?? 'light'} 
        colorThemeRenderer={colorThemeRenderer}
      />
    ),
    [colorScheme, colorThemeRenderer]
  )

  // ─── Memoized render function for filter chips ────────────────────────────────
  const renderFilterChips = useCallback(() => {
    return FILTERS.map((f) => (
      <FilterChip
        key={f}
        label={f}
        isActive={activeFilter === f}
        onPress={() => setActiveFilter(f)}
        colorScheme={colorScheme ?? 'light'}
        colorThemeRenderer={colorThemeRenderer}
      />
    ))
  }, [activeFilter, colorScheme, colorThemeRenderer])

  // ─── Memoized key extractor for FlatList ──────────────────────────────────────
  const keyExtractor = useCallback((item: Listing) => item.id, [])

  return (
    <ThemedView style={{ flex: 1 }}>
      <SearchBar
        ref={searchInputRef}
        value={searchValue}
        onChangeText={setSearchValue}
        autoFocus={true}
      />

      <ScrollView
        style={[
          PageStyles.container,
          { backgroundColor: Colors[colorScheme ?? 'light'].background },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEventThrottle={16}  // Optimize scroll performance
      >
        {/* Results Count and Filter Section */}
        <ThemedView style={{ paddingHorizontal: 10, paddingVertical: 16 }}>
          <ThemedText
            style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 12,
              color: colorThemeRenderer.oppositeTextColor,
            }}
          >
            {filteredListings.length} matches found
          </ThemedText>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={PageStyles.filterRow}
            scrollEventThrottle={16}  // Optimize scroll performance
          >
            {renderFilterChips()}
          </ScrollView>
        </ThemedView>

        {/* Listings List - Optimized for Large Lists */}
        {filteredListings.length > 0 ? (
          <FlatList
            data={filteredListings}
            keyExtractor={keyExtractor}
            renderItem={renderListingCard}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingTop: 8,
            }}
            // ─── PERFORMANCE OPTIMIZATIONS FOR 450+ ITEMS ───────────────────
            // Only render items visible on screen + buffer
            initialNumToRender={10}           // Render first 10 items
            maxToRenderPerBatch={10}          // Render max 10 items per batch
            updateCellsBatchingPeriod={50}    // Update cells every 50ms
            windowSize={10}                   // Keep 10 items in memory above/below viewport
            removeClippedSubviews={true}      // Remove items outside viewport
            // ─────────────────────────────────────────────────────────────
            getItemLayout={(data, index) => ({
              length: 166,  // 150px height + 16px margin
              offset: 166 * index,
              index,
            })}
            CellRendererComponent={({ item, index, ...props }) => (
              <View {...props}>
                {renderListingCard({ item: item as Listing })}
              </View>
            )}
            // Avoid creating new objects on every render
            ListEmptyComponent={
              <ThemedView style={[PageStyles.emptyStateContainer, { marginTop: 40 }]}>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colorThemeRenderer.secondaryFontColor,
                  }}
                >
                  No listings found
                </ThemedText>
              </ThemedView>
            }
          />
        ) : (
          <ThemedView style={[PageStyles.emptyStateContainer, { marginTop: 40 }]}>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: colorThemeRenderer.secondaryFontColor,
              }}
            >
              No listings found
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({})