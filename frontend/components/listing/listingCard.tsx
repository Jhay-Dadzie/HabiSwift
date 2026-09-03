import React, { memo, useCallback, useRef } from 'react'
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Bath, BedDouble, Heart, MapPin, Star } from 'lucide-react-native'
import { Ionicons } from '@expo/vector-icons'

import { ThemedText } from '@/components/themed-text'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useIsWishlisted } from '@/contexts/WishlistContext'
import { Listing } from '@/types/listing'
import { formatPeriod, formatPrice } from '@/utils/listings'
import { selectionFeedback, tapFeedback } from '@/utils/haptics'

const { width } = Dimensions.get('window')

export const CARD_SIZES = {
  large: { width: Math.min(width * 0.68, 300), image: 168 },
  compact: { width: Math.min(width * 0.46, 210), image: 124 },
  /** Row height is fixed so lists can use `getItemLayout` and skip measurement. */
  row: { height: 132, gap: 14 },
} as const

export const ROW_ITEM_HEIGHT = CARD_SIZES.row.height + CARD_SIZES.row.gap

export type CardVariant = keyof typeof CARD_SIZES

interface ListingCardProps {
  listing: Listing
  variant?: CardVariant
  /** Overrides the default push to the listing detail screen. */
  onPress?: (listing: Listing) => void
}

// ─── Save button ──────────────────────────────────────────────────────────────

function SaveButton({ id, size = 20 }: { id: string; size?: number }) {
  const theme = usePageThemeRender()
  const [saved, toggle] = useIsWishlisted(id)
  const scale = useRef(new Animated.Value(1)).current

  const onPress = useCallback(() => {
    const added = toggle()
    selectionFeedback()
    // Pop the heart on save, settle it back on un-save.
    Animated.sequence([
      Animated.spring(scale, {
        toValue: added ? 1.35 : 0.85,
        useNativeDriver: true,
        speed: 50,
        bounciness: 12,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start()
  }, [toggle, scale])

  return (
    <Pressable
      onPress={onPress}
      // Small target visually, comfortable target for thumbs.
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      accessibilityState={{ selected: saved }}
      style={[
        styles.saveButton,
        { width: size + 14, height: size + 14, borderRadius: (size + 14) / 2 },
        { backgroundColor: theme.overlay },
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {saved ? (
          <Ionicons name="heart" size={size} color={theme.danger} />
        ) : (
          <Heart size={size} color={theme.oppositeTextColor} />
        )}
      </Animated.View>
    </Pressable>
  )
}

// ─── Shared pieces ────────────────────────────────────────────────────────────

function Rating({ listing, size = 14 }: { listing: Listing; size?: number }) {
  const theme = usePageThemeRender()
  return (
    <View style={styles.inlineRow}>
      <Star color={theme.star} fill={theme.star} size={size} strokeWidth={2.5} />
      <ThemedText style={[styles.metaText, { color: theme.secondaryFontColor }]}>
        {listing.rating.toFixed(1)}
      </ThemedText>
    </View>
  )
}

function SpecRow({ listing, size = 15 }: { listing: Listing; size?: number }) {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()
  const tint = Colors[colorScheme].tint
  return (
    <View style={styles.specRow}>
      <View style={styles.inlineRow}>
        <BedDouble size={size} color={tint} />
        <ThemedText style={[styles.metaText, { color: theme.secondaryFontColor }]}>
          {listing.bedrooms}
        </ThemedText>
      </View>
      <View style={styles.inlineRow}>
        <Bath size={size} color={tint} />
        <ThemedText style={[styles.metaText, { color: theme.secondaryFontColor }]}>
          {listing.bathrooms}
        </ThemedText>
      </View>
      {listing.furnished && (
        <View style={[styles.pill, { backgroundColor: theme.secondaryBackground }]}>
          <ThemedText style={[styles.pillText, { color: theme.secondaryFontColor }]}>
            Furnished
          </ThemedText>
        </View>
      )}
    </View>
  )
}

function Price({ listing, large }: { listing: Listing; large?: boolean }) {
  const theme = usePageThemeRender()
  return (
    <ThemedText
      numberOfLines={1}
      style={[
        large ? styles.priceLarge : styles.price,
        { color: theme.oppositeTextColor },
      ]}
    >
      {formatPrice(listing)}
      <ThemedText style={[styles.pricePeriod, { color: theme.secondaryFontColor }]}>
        {formatPeriod(listing)}
      </ThemedText>
    </ThemedText>
  )
}

function LocationRow({ listing }: { listing: Listing }) {
  const theme = usePageThemeRender()
  return (
    <View style={styles.inlineRow}>
      <MapPin size={14} color={theme.icon} />
      <ThemedText
        numberOfLines={1}
        style={[styles.metaText, { color: theme.secondaryFontColor, flex: 1 }]}
      >
        {listing.location}
      </ThemedText>
    </View>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ListingCardBase({ listing, variant = 'large', onPress }: ListingCardProps) {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()
  const router = useRouter()
  const scale = useRef(new Animated.Value(1)).current

  const handlePress = useCallback(() => {
    tapFeedback()
    if (onPress) onPress(listing)
    else router.push({ pathname: '/listing/[id]', params: { id: listing.id } })
  }, [onPress, listing, router])

  // Native-driven press scale — the touch feedback runs on the UI thread, so it
  // stays smooth even while the list below is still committing rows.
  const animateTo = useCallback(
    (toValue: number) =>
      Animated.spring(scale, {
        toValue,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }).start(),
    [scale]
  )

  const surface = {
    backgroundColor: theme.cardBackground,
    borderColor: theme.borderColor,
  }

  const body =
    variant === 'row' ? (
      <View style={[styles.row, styles.surface, surface]}>
        <Image
          source={{ uri: listing.images[0] }}
          style={[styles.rowImage, { backgroundColor: theme.skeleton }]}
          contentFit="cover"
          transition={220}
          cachePolicy="memory-disk"
          recyclingKey={listing.id}
        />
        <View style={styles.rowContent}>
          <View style={styles.rowHeader}>
            <Price listing={listing} />
            <Rating listing={listing} />
          </View>
          <ThemedText
            numberOfLines={1}
            style={[styles.typeText, { color: theme.oppositeTextColor }]}
          >
            {listing.type}
          </ThemedText>
          <LocationRow listing={listing} />
          <SpecRow listing={listing} />
        </View>
        <View style={styles.rowSaveSlot}>
          <SaveButton id={listing.id} size={18} />
        </View>
      </View>
    ) : (
      <View
        style={[
          styles.surface,
          styles.stack,
          surface,
          { width: CARD_SIZES[variant].width },
        ]}
      >
        <View>
          <Image
            source={{ uri: listing.images[0] }}
            style={[
              styles.stackImage,
              { height: CARD_SIZES[variant].image, backgroundColor: theme.skeleton },
            ]}
            contentFit="cover"
            transition={220}
            cachePolicy="memory-disk"
            recyclingKey={listing.id}
          />
          <View
            style={[styles.typeBadge, { backgroundColor: Colors[colorScheme].tint }]}
          >
            <ThemedText style={styles.typeBadgeText}>
              {listing.type.toUpperCase()}
            </ThemedText>
          </View>
          <View style={styles.stackSaveSlot}>
            <SaveButton id={listing.id} size={variant === 'large' ? 20 : 17} />
          </View>
          {listing.verified && (
            <View style={[styles.verifiedBadge, { backgroundColor: theme.overlay }]}>
              <Ionicons name="shield-checkmark" size={12} color={theme.success} />
              <ThemedText style={[styles.verifiedText, { color: theme.success }]}>
                Verified
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.stackContent}>
          <View style={styles.rowHeader}>
            <Price listing={listing} large={variant === 'large'} />
            <Rating listing={listing} />
          </View>
          <LocationRow listing={listing} />
          <SpecRow listing={listing} />
        </View>
      </View>
    )

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      accessibilityRole="button"
      accessibilityLabel={`${listing.type} in ${listing.location}, ${formatPrice(listing)}${formatPeriod(listing)}`}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{body}</Animated.View>
    </Pressable>
  )
}

/**
 * Cards are pure functions of their listing, so a shallow id/variant check is
 * enough — save state comes from context inside `SaveButton`, which keeps a
 * wishlist toggle from re-rendering every row in the list.
 */
export const ListingCard = memo(
  ListingCardBase,
  (prev, next) =>
    prev.listing.id === next.listing.id &&
    prev.variant === next.variant &&
    prev.onPress === next.onPress
)

ListingCard.displayName = 'ListingCard'

export default ListingCard

const styles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  /* Vertical (rail) variants */
  stack: {},
  stackImage: {
    width: '100%',
  },
  stackContent: {
    padding: 12,
    gap: 6,
  },
  stackSaveSlot: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  /* Horizontal (list) variant */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CARD_SIZES.row.height,
    padding: 10,
    gap: 12,
  },
  rowImage: {
    width: 104,
    height: '100%',
    borderRadius: 14,
  },
  rowContent: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowSaveSlot: {
    alignSelf: 'flex-start',
  },

  /* Bits */
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  priceLarge: {
    fontSize: 19,
    fontWeight: '700',
    flexShrink: 1,
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: '500',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})
