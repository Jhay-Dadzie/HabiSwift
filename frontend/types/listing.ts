/**
 * Shared listing domain types.
 *
 * `RawListing` mirrors the shape that comes off the wire (currently
 * `assets/data/mock_data.json`, later the API). `Listing` is the normalised
 * shape every screen renders. Keeping the two apart means swapping the mock
 * source for a real endpoint only touches `utils/listings.ts`.
 */

export const HOUSE_TYPES = [
  'Single Room',
  'Chamber and Hall',
  'Self-Contained',
  'Apartment',
  'Compound House',
] as const

export type HouseType = (typeof HOUSE_TYPES)[number]

export const AMENITIES = [
  'Wi-fi',
  'Kitchen',
  'Car park',
  'Swimming pool',
  'Gym',
  'Playground',
  'High Level Camera Surveillance',
  'Coffee Shop',
  'Cinema',
  'Library',
  'Arcade',
] as const

export type Amenity = (typeof AMENITIES)[number]

export type RentPeriod = 'month' | 'year'

export interface RawListing {
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

export interface Listing {
  id: string
  type: HouseType
  /** Rent in GHS for the `period` below. */
  price: number
  currency: string
  period: RentPeriod
  /** Rent normalised to a monthly figure — used for sorting and range filters. */
  monthlyPrice: number
  bedrooms: number
  bathrooms: number
  /** Street line, e.g. "12 Boundary Road". */
  street: string
  /** Neighbourhood, e.g. "East Legon". */
  area: string
  city: string
  /** "East Legon, Accra" — what cards display. */
  location: string
  amenities: string[]
  images: string[]
  rating: number
  reviews: number
  distanceKm: number
  /** Furnished listings surface a badge and are filterable. */
  furnished: boolean
  verified: boolean
  description: string
}

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating' | 'nearest'

export interface Filters {
  query: string
  types: HouseType[]
  amenities: string[]
  /** Monthly GHS bounds. `null` means "no bound". */
  minPrice: number | null
  maxPrice: number | null
  /** Minimum bedrooms; 0 means "any". */
  bedrooms: number
  bathrooms: number
  city: string | null
  furnishedOnly: boolean
  sort: SortKey
}

export const DEFAULT_FILTERS: Filters = {
  query: '',
  types: [],
  amenities: [],
  minPrice: null,
  maxPrice: null,
  bedrooms: 0,
  bathrooms: 0,
  city: null,
  furnishedOnly: false,
  sort: 'recommended',
}
