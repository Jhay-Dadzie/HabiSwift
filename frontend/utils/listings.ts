import rawData from '@/assets/data/mock_data.json'
import {
  DEFAULT_FILTERS,
  Filters,
  HOUSE_TYPES,
  HouseType,
  Listing,
  RawListing,
  SortKey,
} from '@/types/listing'

/**
 * ─── Data adapter ────────────────────────────────────────────────────────────
 *
 * The seed file is randomly generated: prices land at "2.49 CNY", bedrooms go
 * up to 24 and the image URLs point at a placeholder service. Rendering that
 * directly makes price/bedroom filters meaningless and the UI look broken, so
 * everything is normalised once, at module load, into the `Listing` shape.
 *
 * Normalisation is deterministic (seeded off each listing's `id`) so a listing
 * looks identical on every launch and across screens. When the real API lands,
 * delete `normalise` and map the response into `Listing` instead — no screen
 * needs to change.
 */

const CITIES: Record<string, string[]> = {
  Accra: [
    'East Legon',
    'Osu',
    'Cantonments',
    'Labone',
    'Airport Residential',
    'Spintex',
    'Adenta',
    'Madina',
    'Achimota',
    'Dansoman',
    'Teshie',
    'Tema',
  ],
  Kumasi: ['Ahodwo', 'Asokwa', 'Nhyiaeso', 'Bantama', 'Oduom'],
  Takoradi: ['Anaji', 'Effia', 'Airport Ridge'],
  'Cape Coast': ['Pedu', 'Abura', 'Kwaprow'],
  Tamale: ['Vittin', 'Kalpohin', 'Education Ridge'],
}

export const CITY_NAMES = Object.keys(CITIES)

/** Curated house photography — the seed file's placeholder URLs never resolve. */
const PHOTO_IDS = [
  '1568605114967-8130f3a36994',
  '1570129477492-45c003edd2be',
  '1512917774080-9991f1c4c750',
  '1560448204-e02f11c3d0e2',
  '1502672260266-1c1ef2d93688',
  '1493809842364-78817add7ffb',
  '1522708323590-d24dbb6b0267',
  '1484154218962-a197022b5858',
  '1600585154340-be6161a56a0c',
  '1600596542815-ffad4c1539a9',
  '1600607687939-ce8a6c25118c',
  '1580587771525-78b9dba3b914',
  '1583608205776-bfd35f0d9f83',
  '1505873242700-f289a29e1e0f',
  '1502005229762-cf1b2da7c5d6',
  '1560185007-cde436f6a4d0',
]

const photoUrl = (idx: number, width = 800) =>
  `https://images.unsplash.com/photo-${PHOTO_IDS[idx % PHOTO_IDS.length]}?auto=format&fit=crop&w=${width}&q=70`

/** Monthly rent bands in GHS, by house type. */
const PRICE_BANDS: Record<HouseType, [number, number]> = {
  'Single Room': [250, 700],
  'Chamber and Hall': [450, 1400],
  'Self-Contained': [800, 2200],
  'Compound House': [600, 1800],
  Apartment: [1800, 7500],
}

/** Max bedrooms that make sense per type. */
const BEDROOM_CAPS: Record<HouseType, number> = {
  'Single Room': 1,
  'Chamber and Hall': 1,
  'Self-Contained': 2,
  'Compound House': 3,
  Apartment: 4,
}

/** FNV-1a — stable across runs, unlike `Math.random`. */
function hash(seed: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Deterministic 0..1 draw for a given listing + field. */
const draw = (id: string, field: string) => (hash(id + field) % 10000) / 10000

const pick = <T,>(list: readonly T[], id: string, field: string) =>
  list[hash(id + field) % list.length]

const isHouseType = (value: string): value is HouseType =>
  (HOUSE_TYPES as readonly string[]).includes(value)

function normalise(raw: RawListing): Listing {
  const type = isHouseType(raw.type) ? raw.type : 'Apartment'
  const id = raw.id

  const [floor, ceiling] = PRICE_BANDS[type]
  // Round to the nearest 50 so prices read like real listings.
  const monthlyPrice =
    Math.round((floor + draw(id, 'price') * (ceiling - floor)) / 50) * 50

  const period = raw.time === 'year' ? 'year' : 'month'
  // Yearly rents in Ghana are typically quoted at a ~2 month discount.
  const price = period === 'year' ? monthlyPrice * 10 : monthlyPrice

  const city = pick(CITY_NAMES, id, 'city')
  const area = pick(CITIES[city], id, 'area')

  const cap = BEDROOM_CAPS[type]
  const bedrooms = 1 + (hash(id + 'bed') % cap)
  const bathrooms = 1 + (hash(id + 'bath') % Math.min(bedrooms + 1, 3))

  // Keep the seed file's image count, swap the unusable URLs for real photos.
  const imageCount = Math.max(1, Math.min(raw.image?.length ?? 1, 5))
  const firstPhoto = hash(id + 'photo') % PHOTO_IDS.length
  const images = Array.from({ length: imageCount }, (_, i) =>
    photoUrl(firstPhoto + i)
  )

  const rating = Math.round((3.4 + draw(id, 'rating') * 1.6) * 10) / 10

  return {
    id,
    type,
    price,
    currency: 'GHS',
    period,
    monthlyPrice,
    bedrooms,
    bathrooms,
    street: raw.location,
    area,
    city,
    location: `${area}, ${city}`,
    amenities: raw.amenities ?? [],
    images,
    rating,
    reviews: 4 + (hash(id + 'reviews') % 180),
    distanceKm: Math.round(draw(id, 'distance') * 250) / 10,
    furnished: draw(id, 'furnished') > 0.55,
    verified: draw(id, 'verified') > 0.35,
    description:
      `A ${type.toLowerCase()} in ${area}, ${city} with ${bedrooms} bedroom` +
      `${bedrooms === 1 ? '' : 's'} and ${bathrooms} bathroom${bathrooms === 1 ? '' : 's'}. ` +
      `Water and electricity run on separate meters, and the compound is ` +
      `${draw(id, 'gated') > 0.5 ? 'gated with 24/7 security' : 'quiet and family friendly'}.`,
  }
}

export const ALL_LISTINGS: Listing[] = (rawData as RawListing[]).map(normalise)

const byId = new Map(ALL_LISTINGS.map((l) => [l.id, l]))

export const getListingById = (id?: string | null): Listing | undefined =>
  id ? byId.get(id) : undefined

export const getListingsByIds = (ids: string[]): Listing[] =>
  ids.map((id) => byId.get(id)).filter((l): l is Listing => Boolean(l))

/** Price bounds across the whole catalogue — drives the filter sheet slider. */
export const PRICE_BOUNDS = ALL_LISTINGS.reduce(
  (acc, l) => ({
    min: Math.min(acc.min, l.monthlyPrice),
    max: Math.max(acc.max, l.monthlyPrice),
  }),
  { min: Infinity, max: 0 }
)

/** Home screen rails — computed once rather than re-sorted on every render. */
export const RECOMMENDED = [...ALL_LISTINGS]
  .sort((a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm)
  .slice(0, 12)

export const NEAR_YOU = [...ALL_LISTINGS]
  .sort((a, b) => a.distanceKm - b.distanceKm)
  .slice(0, 12)

export const AFFORDABLE = [...ALL_LISTINGS]
  .filter((l) => l.rating >= 4)
  .sort((a, b) => a.monthlyPrice - b.monthlyPrice)
  .slice(0, 12)

// ─── Filtering ────────────────────────────────────────────────────────────────

const SORTERS: Record<SortKey, (a: Listing, b: Listing) => number> = {
  recommended: (a, b) => b.rating - a.rating || a.distanceKm - b.distanceKm,
  'price-asc': (a, b) => a.monthlyPrice - b.monthlyPrice,
  'price-desc': (a, b) => b.monthlyPrice - a.monthlyPrice,
  rating: (a, b) => b.rating - a.rating,
  nearest: (a, b) => a.distanceKm - b.distanceKm,
}

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Top rated' },
  { key: 'nearest', label: 'Nearest to me' },
]

export function applyFilters(listings: Listing[], filters: Filters): Listing[] {
  const query = filters.query.trim().toLowerCase()

  const result = listings.filter((l) => {
    if (query) {
      const haystack = `${l.location} ${l.type} ${l.street} ${l.city}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (filters.types.length && !filters.types.includes(l.type)) return false
    if (filters.city && l.city !== filters.city) return false
    if (filters.minPrice !== null && l.monthlyPrice < filters.minPrice) return false
    if (filters.maxPrice !== null && l.monthlyPrice > filters.maxPrice) return false
    if (filters.bedrooms && l.bedrooms < filters.bedrooms) return false
    if (filters.bathrooms && l.bathrooms < filters.bathrooms) return false
    if (filters.furnishedOnly && !l.furnished) return false
    if (
      filters.amenities.length &&
      !filters.amenities.every((a) => l.amenities.includes(a))
    ) {
      return false
    }
    return true
  })

  return result.sort(SORTERS[filters.sort] ?? SORTERS.recommended)
}

/** How many filter groups are active — drives the badge on the filter button. */
export function countActiveFilters(filters: Filters): number {
  let count = 0
  if (filters.types.length) count++
  if (filters.amenities.length) count++
  if (filters.minPrice !== null || filters.maxPrice !== null) count++
  if (filters.bedrooms) count++
  if (filters.bathrooms) count++
  if (filters.city) count++
  if (filters.furnishedOnly) count++
  if (filters.sort !== DEFAULT_FILTERS.sort) count++
  return count
}

/** Compact money formatting — "GHS 1,850" / "GHS 18,500". */
export const formatPrice = (listing: Listing) =>
  `${listing.currency} ${listing.price.toLocaleString('en-GH')}`

export const formatPeriod = (listing: Listing) =>
  listing.period === 'year' ? '/yr' : '/mo'
