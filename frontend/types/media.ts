/**
 * Media attached to a landlord's listing.
 *
 * The product rule is a single combined budget, not two separate ones:
 * **at most 10 items in total, of which at most 2 may be videos.** So 10 photos
 * is valid, 8 photos + 2 videos is valid, and 9 photos + 2 videos is not.
 */

export const MAX_MEDIA = 10
export const MAX_VIDEOS = 2

export type MediaKind = 'image' | 'video'

export interface ListingMedia {
  id: string
  uri: string
  kind: MediaKind
  width?: number
  height?: number
  /** Video length in seconds — undefined for images. */
  duration?: number
  /** Poster frame for videos, generated at pick time. */
  thumbnailUri?: string
  /** Bytes, when the picker reports it. */
  fileSize?: number
}

/** Why a picked item could not be added. */
export type RejectionReason = 'total-limit' | 'video-limit' | 'duplicate' | 'too-long'

export interface Rejection {
  item: ListingMedia
  reason: RejectionReason
}

export interface AdditionPlan {
  accepted: ListingMedia[]
  rejected: Rejection[]
}

/** Longest video we accept, in seconds. */
export const MAX_VIDEO_SECONDS = 60
