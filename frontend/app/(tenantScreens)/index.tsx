import {
  StyleSheet,
  Image,
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import React, { useState } from 'react'
import { PageStyles } from '@/components/globalStyles/pageStyles'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import mockData from '@/assets/data/mock_data.json'
import { BedDouble, Bell, Heart, MapPin, Star } from 'lucide-react-native'
import { Ionicons } from "@expo/vector-icons"
import SearchBar from '@/components/searchBar'
import { CardStyles } from '@/components/globalStyles/cardStyles'

const { width } = Dimensions.get('window')

// ─── Types ────────────────────────────────────────────────────────────────────
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
const FILTERS = ['All', 'Price', 'Location' ,'Apartment', 'Chamber and Hall', 'Single Room', 'Self-Contained']

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

// ─── House card (large – for Recommended) ─────────────────────────────────────
function LargeCard({ item }: { item: Listing }) {
  const colorThemeRenderer = usePageThemeRender()
  const colorScheme = useColorScheme()
  const [liked, setLiked] = useState(false)

  return (
    <TouchableOpacity style={[CardStyles.flexLargeCard, {
        backgroundColor: colorScheme === 'light' ? '#fff' : Colors.dark.background,
        borderColor: colorThemeRenderer.borderColor
      }]} 
      activeOpacity={0.85}
    >
      {/* Single image */}
      <Image
        source={{ uri: item.image[0] }}
        style={CardStyles.flexLargeCardImage}
        resizeMode="cover"
      />
      {/* Type badge */}
      <View style={[styles.typeBadge, {backgroundColor: Colors[useColorScheme() ?? 'light'].tint}]}>
        <ThemedText style={styles.typeBadgeText}>{item.type.toUpperCase()}</ThemedText>
      </View>
      {/* Favourite icon */}
      <TouchableOpacity onPress={() => setLiked(prev => !prev)} style={[styles.favBtn,
          {backgroundColor: colorThemeRenderer.secondaryBackground}
        ]}
      >
        {
          liked ? (<Ionicons name='heart' size={20} color={'red'}/>) :
          (<Heart size={20} color={colorThemeRenderer.oppositeTextColor}/>)
        }
      </TouchableOpacity>

      {/* Details */}
      <View style={CardStyles.flexCardDetails}>
        {/* Price row */}
        <View style={CardStyles.flexCardRow}>
          <ThemedText type='price' style={{color: colorThemeRenderer.oppositeTextColor}}>
            {item.currency} {item.price.toLocaleString()}/{item.time}
          </ThemedText>
          <View style={styles.ratingRow}>
            <Star color={'#EAB308'} size={16} strokeWidth={2.5}/>
            <ThemedText type='defaultSemiBold' style={{color: colorThemeRenderer.secondaryFontColor}}>
              {item.rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>
        {/* Location */}
        <View style={styles.cardDetailsRowWithIcon}>
          <MapPin size={18} color={colorThemeRenderer.icon} />
          <ThemedText style={CardStyles.cardLocation} numberOfLines={1}>
            {item.location}
          </ThemedText>
        </View>
        {/* Bedrooms */}
        <View style={styles.cardDetailsRowWithIcon}>
          <BedDouble size={18} color={Colors[colorScheme ?? 'light'].tint}/>
          <ThemedText type='defaultSemiBold' style={[{
            color: colorThemeRenderer.secondaryFontColor
          }]}>
            {item.bedrooms} Bedroom{item.bedrooms !== 1 ? 's' : ''}
          </ThemedText>

        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── House card (small – for Near You) ────────────────────────────────────────
function SmallCard({ item }: { item: Listing }) {
  const colorScheme = useColorScheme()
  const colorThemeRenderer = usePageThemeRender()
  const [liked, setLiked] = useState(false)
  return (
    <TouchableOpacity style={[CardStyles.flexSmallCard, {
        backgroundColor: colorScheme === 'light' ? '#fff' : Colors.dark.background,
        borderColor: colorThemeRenderer.borderColor
      }]} 
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.image[0] }}
        style={CardStyles.flexSmallCardImage}
        resizeMode="cover"
      />
      <View style={[styles.typeBadgeSmall, {backgroundColor: Colors[useColorScheme() ?? 'light'].tint}]}>
        <ThemedText style={styles.typeBadgeText}>{item.type.toUpperCase()}</ThemedText>
      </View>
      {/* Favourite icon */}
      <TouchableOpacity onPress={() => setLiked(prev => !prev)} style={[styles.favBtnSmall,
          {backgroundColor: colorThemeRenderer.secondaryBackground}
        ]}
      >
        {
          liked ? (<Ionicons name='heart' size={16} color={'red'}/>) :
          (<Heart size={16} color={colorThemeRenderer.oppositeTextColor}/>)
        }
      </TouchableOpacity>

      <View style={CardStyles.flexSmallCardDetails}>
        <View style={CardStyles.flexCardRow}>
          <ThemedText style={[styles.smallCardPrice, {
              color: colorThemeRenderer.oppositeTextColor
            }]}
          >
            {item.currency} {item.price.toLocaleString()}/{item.time.slice(0, 2)}
          </ThemedText>
          <View style={styles.ratingRow}>
          <Star color={'#EAB308'} size={14} strokeWidth={2.5}/>
            <ThemedText type='defaultSemiBold' style={{color: colorThemeRenderer.secondaryFontColor}}>
              {item.rating.toFixed(1)}
            </ThemedText>
          </View>
        </View>
        {/*Location*/}
        <View style={styles.cardDetailsRowWithIcon}>
          <MapPin size={16} color={colorThemeRenderer.icon} />
          <ThemedText style={CardStyles.cardLocation} numberOfLines={1}>
            {item.location}
          </ThemedText>
        </View>
        <View style={styles.cardDetailsRowWithIcon}>
          <BedDouble size={16} color={Colors[colorScheme ?? 'light'].tint}/>
          <ThemedText type='defaultSemiBold' style={[{
            color: colorThemeRenderer.secondaryFontColor
          }]}>
            {item.bedrooms} Bedroom{item.bedrooms !== 1 ? 's' : ''}
          </ThemedText>

        </View>
      </View>
    </TouchableOpacity>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Index() {
  const colorScheme = useColorScheme()
  const colorThemeRenderer = usePageThemeRender()
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('All')

  // Filter recommended list based on active chip
  const filteredRecommended =
    activeFilter === 'All' || activeFilter === 'Price'
      ? recommended
      : recommended.filter((l) => l.type === activeFilter)

  const filteredNearYou =
    activeFilter === 'All' || activeFilter === 'Price'
      ? nearYou
      : nearYou.filter((l) => l.type === activeFilter)

  const bgColor = Colors[colorScheme ?? 'light'].background

  return (
    <ScrollView
      style={[PageStyles.container, { backgroundColor: bgColor }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      stickyHeaderIndices={[1]}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <ThemedView style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Avatar placeholder */}
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>J</ThemedText>
          </View>
          <View>
            <ThemedText style={styles.greeting}>Good evening</ThemedText>
            <ThemedText style={[styles.userName, {color: colorThemeRenderer.oppositeTextColor}]}>Joseph</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={[styles.notifBtn, {
            backgroundColor: colorThemeRenderer.iconContainer,
            borderColor: colorThemeRenderer.borderColor
          }]}
        >
          <Bell size={20} color={colorThemeRenderer.oppositeTextColor}/>
        </TouchableOpacity>
      </ThemedView>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <SearchBar autoFocus={false} onPress={() => router.push('/(tenantScreens)/search')}/>

      {/* ── Filter chips ───────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={PageStyles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[PageStyles.filters,
              activeFilter === f ? {backgroundColor: Colors[colorScheme ?? 'light'].tint} 
              : {backgroundColor: colorThemeRenderer.secondaryBackground},
              {
                borderColor: colorThemeRenderer.borderColor,
              }]}
            onPress={() => setActiveFilter(f)}
          >
            <ThemedText
              style={[PageStyles.filtersText,
                activeFilter === f ? {color: '#fff'}
                : {color: colorThemeRenderer.secondaryFontColor},
              ]}
            >
              {f}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Recommended for you ────────────────────────────────────────────── */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type='title' style={{color: colorThemeRenderer.oppositeTextColor}}>Recommended for you</ThemedText>
        <TouchableOpacity>
          <ThemedText type='link' style={{color: colorThemeRenderer.link}}>
            See all
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={filteredRecommended}
        keyExtractor={(item) => `rec-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <LargeCard item={item} />}
        ListEmptyComponent={
          <View style={{ flex: 1, width: width - 40, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedView style={PageStyles.emptyStateContainer}>
              <Image style={PageStyles.emptyStateImage} source={require('@/assets/images/emptyState.png')} />
              <ThemedText style={[PageStyles.emptyText]}>No listings found.</ThemedText>
            </ThemedView>
          </View>
        }
      />

      {/* ── Houses Near Your Location ──────────────────────────────────────── */}
      <ThemedView style={styles.sectionHeader}>
        <ThemedText type='title' style={{color: colorThemeRenderer.oppositeTextColor}}>Houses Near Your Location</ThemedText>
        <TouchableOpacity>
          <ThemedText type='link' style={{color: colorThemeRenderer.link}}>See all</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <FlatList
        data={filteredNearYou}
        keyExtractor={(item) => `near-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => <SmallCard item={item} />}
        ListEmptyComponent={
          <View style={{ flex: 1, width: width - 40, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedView style={PageStyles.emptyStateContainer}>
              <Image style={PageStyles.emptyStateImage} source={require('@/assets/images/emptyState.png')} />
              <ThemedText style={[PageStyles.emptyText]}>No listings found.</ThemedText>
            </ThemedView>
          </View>
        }
      />

      {/* Bottom spacer */}
      <View style={{ height: 32 }} />
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PURPLE = '#6C63FF'

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'transparent',
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
    backgroundColor: PURPLE,
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
    color: '#888',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterIconBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Chips */
  

  /* Section header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  /* Horizontal lists */
  horizontalList: {
    paddingHorizontal: 10,
    gap: 14,
    paddingBottom: 4,
    marginBottom: 24,
  },

  /* Large card */
  

  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardDetailsRowWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  cardBed: {
    fontWeight: 500
  },

  /* Small card */
  
  typeBadgeSmall: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: PURPLE,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  favBtnSmall: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCardPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
})