import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Bath, BedDouble, MapPin, Star } from 'lucide-react-native'

import { ThemedText } from '@/components/themed-text'
import EmptyState from '@/components/emptyState'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useIsWishlisted } from '@/contexts/WishlistContext'
import { formatPeriod, formatPrice, getListingById } from '@/utils/listings'
import { selectionFeedback, tapFeedback } from '@/utils/haptics'

const AMENITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Wi-fi': 'wifi',
  Kitchen: 'restaurant-outline',
  'Car park': 'car-outline',
  'Swimming pool': 'water-outline',
  Gym: 'barbell-outline',
  Playground: 'happy-outline',
  'High Level Camera Surveillance': 'videocam-outline',
  'Coffee Shop': 'cafe-outline',
  Cinema: 'film-outline',
  Library: 'book-outline',
  Arcade: 'game-controller-outline',
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const listing = useMemo(() => getListingById(id), [id])

  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  const [imageIndex, setImageIndex] = useState(0)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setImageIndex(viewableItems[0].index)
      }
    }
  ).current
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current

  // Hooks must run before the "not found" early return.
  const [saved, toggleSaved] = useIsWishlisted(listing?.id ?? '')

  const onSave = useCallback(() => {
    if (!listing) return
    toggleSaved()
    selectionFeedback()
  }, [listing, toggleSaved])

  const renderPhoto = useCallback(
    ({ item }: { item: string }) => (
      <Image
        source={{ uri: item }}
        style={{ width, height: 320, backgroundColor: theme.skeleton }}
        contentFit="cover"
        transition={220}
        cachePolicy="memory-disk"
      />
    ),
    [width, theme.skeleton]
  )

  if (!listing) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <EmptyState
          title="Listing unavailable"
          subtitle="This home may have been taken down."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    )
  }

  const tint = Colors[colorScheme].tint

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Photo carousel ───────────────────────────────────────────────── */}
        <View>
          <FlatList
            data={listing.images}
            keyExtractor={(uri, index) => `${listing.id}-${index}`}
            renderItem={renderPhoto}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />

          {listing.images.length > 1 && (
            <View style={styles.dots}>
              {listing.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === imageIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                      width: index === imageIndex ? 18 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Floating controls sit over the photo, clear of the notch. */}
          <View style={[styles.floatingBar, { top: insets.top + 8 }]}>
            <Pressable
              onPress={() => {
                tapFeedback()
                router.back()
              }}
              style={[styles.circleButton, { backgroundColor: theme.overlay }]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={theme.oppositeTextColor} />
            </Pressable>

            <Pressable
              onPress={onSave}
              style={[styles.circleButton, { backgroundColor: theme.overlay }]}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              accessibilityState={{ selected: saved }}
            >
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={20}
                color={saved ? theme.danger : theme.oppositeTextColor}
              />
            </Pressable>
          </View>
        </View>

        {/* ── Summary ──────────────────────────────────────────────────────── */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleText}>
              <ThemedText style={[styles.price, { color: theme.oppositeTextColor }]}>
                {formatPrice(listing)}
                <ThemedText
                  style={[styles.period, { color: theme.secondaryFontColor }]}
                >
                  {formatPeriod(listing)}
                </ThemedText>
              </ThemedText>
              <ThemedText style={[styles.type, { color: theme.secondaryFontColor }]}>
                {listing.type}
              </ThemedText>
            </View>
            <View style={[styles.ratingBox, { backgroundColor: theme.secondaryBackground }]}>
              <Star color={theme.star} fill={theme.star} size={15} strokeWidth={2.5} />
              <ThemedText
                style={[styles.ratingValue, { color: theme.oppositeTextColor }]}
              >
                {listing.rating.toFixed(1)}
              </ThemedText>
              <ThemedText style={{ color: theme.secondaryFontColor, fontSize: 12 }}>
                ({listing.reviews})
              </ThemedText>
            </View>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color={theme.icon} />
            <ThemedText style={[styles.location, { color: theme.secondaryFontColor }]}>
              {listing.street}, {listing.location} · {listing.distanceKm} km away
            </ThemedText>
          </View>

          {/* ── Spec strip ─────────────────────────────────────────────────── */}
          <View
            style={[
              styles.specStrip,
              {
                backgroundColor: theme.secondaryBackground,
                borderColor: theme.borderColor,
              },
            ]}
          >
            <Spec
              icon={<BedDouble size={18} color={tint} />}
              value={`${listing.bedrooms}`}
              label={listing.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
            />
            <View style={[styles.specDivider, { backgroundColor: theme.borderColor }]} />
            <Spec
              icon={<Bath size={18} color={tint} />}
              value={`${listing.bathrooms}`}
              label={listing.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
            />
            <View style={[styles.specDivider, { backgroundColor: theme.borderColor }]} />
            <Spec
              icon={
                <Ionicons
                  name={listing.furnished ? 'bed-outline' : 'cube-outline'}
                  size={18}
                  color={tint}
                />
              }
              value={listing.furnished ? 'Yes' : 'No'}
              label="Furnished"
            />
          </View>

          {listing.verified && (
            <View
              style={[styles.verifiedRow, { backgroundColor: theme.tipsBackground }]}
            >
              <Ionicons name="shield-checkmark" size={18} color={theme.tipsTextColor} />
              <ThemedText style={{ color: theme.tipsTextColor, fontWeight: '600' }}>
                Ownership documents verified by HabiSwift
              </ThemedText>
            </View>
          )}

          {/* ── Description ────────────────────────────────────────────────── */}
          <Section title="About this place">
            <ThemedText style={[styles.paragraph, { color: theme.secondaryFontColor }]}>
              {listing.description}
            </ThemedText>
          </Section>

          {/* ── Amenities ──────────────────────────────────────────────────── */}
          {listing.amenities.length > 0 && (
            <Section title="What this place offers">
              <View style={styles.amenityGrid}>
                {listing.amenities.map((amenity) => (
                  <View
                    key={amenity}
                    style={[
                      styles.amenity,
                      {
                        backgroundColor: theme.secondaryBackground,
                        borderColor: theme.borderColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={AMENITY_ICONS[amenity] ?? 'checkmark-circle-outline'}
                      size={16}
                      color={tint}
                    />
                    <ThemedText
                      style={[styles.amenityText, { color: theme.secondaryFontColor }]}
                    >
                      {amenity}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Section>
          )}
        </View>
      </ScrollView>

      {/* ── Action bar ─────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.borderColor,
            paddingBottom: Math.max(insets.bottom, 14),
          },
        ]}
      >
        <Pressable
          onPress={() => {
            tapFeedback()
            Linking.openURL('tel:+233000000000').catch(() => {})
          }}
          style={({ pressed }) => [
            styles.callButton,
            { borderColor: theme.borderColor, opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Call the landlord"
        >
          <Ionicons name="call-outline" size={20} color={theme.oppositeTextColor} />
        </Pressable>

        <Pressable
          onPress={() => {
            tapFeedback()
            router.push('/(tenantScreens)/messages')
          }}
          style={({ pressed }) => [
            styles.messageButton,
            { backgroundColor: tint, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <ThemedText style={styles.messageText}>Message landlord</ThemedText>
        </Pressable>
      </View>
    </View>
  )
}

function Spec({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  const theme = usePageThemeRender()
  return (
    <View style={styles.spec}>
      {icon}
      <ThemedText style={[styles.specValue, { color: theme.oppositeTextColor }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.specLabel, { color: theme.secondaryFontColor }]}>
        {label}
      </ThemedText>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = usePageThemeRender()
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: theme.oppositeTextColor }]}>
        {title}
      </ThemedText>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
    gap: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleText: {
    flex: 1,
    gap: 2,
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
  },
  period: {
    fontSize: 15,
    fontWeight: '500',
  },
  type: {
    fontSize: 15,
    fontWeight: '600',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  specStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
  },
  spec: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  specDivider: {
    width: 1,
    height: 36,
  },
  specValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  specLabel: {
    fontSize: 12,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  callButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
