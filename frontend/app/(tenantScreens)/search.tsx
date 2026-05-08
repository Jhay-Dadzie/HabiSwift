import { FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useRouter } from 'expo-router'
import SearchBar from '@/components/searchBar'
import React, { useRef, useEffect, useState, useMemo } from 'react'
import mockData from '@/assets/data/mock_data.json'
import { CardStyles } from '@/components/globalStyles/cardStyles'
import { PageStyles } from '@/components/globalStyles/pageStyles'

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

  // ─── Listing Card Component ──────────────────────────────────────────────────
  const ListingCard = ({ item }: { item: Listing }) => {
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
              backgroundColor: colorScheme === 'light' ? '#fff' : Colors.dark.background,
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
          <View style={CardStyles.listCardText}>
            {/* Price and Type */}
            <View style={CardStyles.flexCardRow}>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colorThemeRenderer.oppositeTextColor,
                }}
              >
                {item.currency} {item.price.toLocaleString()}
                <ThemedText style={{ fontSize: 12, fontWeight: '400' }}>
                  /{item.time.slice(0, 2)}
                </ThemedText>
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: colorThemeRenderer.secondaryFontColor,
                }}
              >
                {item.type}
              </ThemedText>
            </View>

            {/* Location */}
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: '400',
                color: colorThemeRenderer.secondaryFontColor,
              }}
              numberOfLines={1}
            >
              {item.location}
            </ThemedText>

            {/* Bedrooms and Rating */}
            <View style={CardStyles.flexCardRow}>
              <ThemedText
                style={{
                  fontSize: 12,
                  fontWeight: '400',
                  color: colorThemeRenderer.secondaryFontColor,
                }}
              >
                {item.bedrooms} Bedroom{item.bedrooms !== 1 ? 's' : ''}
              </ThemedText>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: colorThemeRenderer.oppositeTextColor,
                  }}
                >
                  {item.rating.toFixed(1)}
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 12,
                    fontWeight: '400',
                    color: colorThemeRenderer.secondaryFontColor,
                  }}
                >
                  (251)
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>
      </TouchableOpacity>
    )
  }

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

          {/* Filter Chips - Identical to index.tsx */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={PageStyles.filterRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  PageStyles.filters,
                  activeFilter === f
                    ? { backgroundColor: Colors[colorScheme ?? 'light'].tint }
                    : { backgroundColor: colorThemeRenderer.secondaryBackground },
                  {
                    borderColor: colorThemeRenderer.borderColor,
                  },
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <ThemedText
                  style={[
                    PageStyles.filtersText,
                    activeFilter === f
                      ? { color: '#fff' }
                      : { color: colorThemeRenderer.secondaryFontColor },
                  ]}
                >
                  {f}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Listings List */}
        {filteredListings.length > 0 ? (
          <FlatList
            data={filteredListings}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <ListingCard item={item} />}
            scrollEnabled={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingTop: 8,
            }}
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