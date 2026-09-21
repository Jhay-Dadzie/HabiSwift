import {
  AdditionPlan,
  ListingMedia,
  MAX_MEDIA,
  MAX_VIDEO_SECONDS,
  MAX_VIDEOS,
  Rejection,
  RejectionReason,
} from '@/types/media'

/**
 * Selection rules for listing media.
 *
 * All of this is pure so the caps can be unit-tested and reused by whatever UI
 * sits on top (picker sheet, camera capture, drag-to-reorder grid).
 */

export const countVideos = (media: ListingMedia[]) =>
  media.filter((m) => m.kind === 'video').length

export const countImages = (media: ListingMedia[]) =>
  media.filter((m) => m.kind === 'image').length

/** Remaining slots in the combined 10-item budget. */
export const remainingSlots = (media: ListingMedia[]) =>
  Math.max(0, MAX_MEDIA - media.length)

/** Remaining video slots, bounded by the combined budget too. */
export const remainingVideoSlots = (media: ListingMedia[]) =>
  Math.min(Math.max(0, MAX_VIDEOS - countVideos(media)), remainingSlots(media))

export const canAddImage = (media: ListingMedia[]) => remainingSlots(media) > 0
export const canAddVideo = (media: ListingMedia[]) => remainingVideoSlots(media) > 0

/**
 * Decide which of `incoming` can join `existing`, in order.
 *
 * Returns both halves rather than silently truncating: the caller needs the
 * rejections to tell the user *why* three of the eight photos they picked did
 * not appear, which is the difference between a bug report and an understood
 * limit.
 */
export function planAddition(
  existing: ListingMedia[],
  incoming: ListingMedia[]
): AdditionPlan {
  const accepted: ListingMedia[] = []
  const rejected: Rejection[] = []

  const seen = new Set(existing.map((m) => m.uri))
  let total = existing.length
  let videos = countVideos(existing)

  for (const item of incoming) {
    let reason: RejectionReason | null = null

    if (seen.has(item.uri)) {
      reason = 'duplicate'
    } else if (
      item.kind === 'video' &&
      item.duration != null &&
      item.duration > MAX_VIDEO_SECONDS
    ) {
      reason = 'too-long'
    } else if (total >= MAX_MEDIA) {
      reason = 'total-limit'
    } else if (item.kind === 'video' && videos >= MAX_VIDEOS) {
      reason = 'video-limit'
    }

    if (reason) {
      rejected.push({ item, reason })
      continue
    }

    accepted.push(item)
    seen.add(item.uri)
    total += 1
    if (item.kind === 'video') videos += 1
  }

  return { accepted, rejected }
}

/** One human-readable line summarising why items were dropped. */
export function describeRejections(rejected: Rejection[]): string | null {
  if (rejected.length === 0) return null

  const counts = rejected.reduce<Record<RejectionReason, number>>(
    (acc, r) => ({ ...acc, [r.reason]: (acc[r.reason] ?? 0) + 1 }),
    {} as Record<RejectionReason, number>
  )

  const parts: string[] = []
  const plural = (n: number) => (n === 1 ? 'item' : 'items')

  if (counts['total-limit']) {
    parts.push(
      `${counts['total-limit']} ${plural(counts['total-limit'])} over the ${MAX_MEDIA}-item limit`
    )
  }
  if (counts['video-limit']) {
    parts.push(
      `${counts['video-limit']} extra video${counts['video-limit'] === 1 ? '' : 's'} (max ${MAX_VIDEOS})`
    )
  }
  if (counts['too-long']) {
    parts.push(
      `${counts['too-long']} video${counts['too-long'] === 1 ? '' : 's'} longer than ${MAX_VIDEO_SECONDS}s`
    )
  }
  if (counts['duplicate']) {
    parts.push(`${counts['duplicate']} already added`)
  }

  return `Skipped ${parts.join(', ')}.`
}

/** "6 photos · 1 video · 3 slots left" — the counter under the media grid. */
export function describeMediaBudget(media: ListingMedia[]): string {
  const images = countImages(media)
  const videos = countVideos(media)
  const left = remainingSlots(media)

  const parts: string[] = []
  if (images) parts.push(`${images} photo${images === 1 ? '' : 's'}`)
  if (videos) parts.push(`${videos} video${videos === 1 ? '' : 's'}`)
  if (parts.length === 0) return `Add up to ${MAX_MEDIA} items (max ${MAX_VIDEOS} videos)`

  parts.push(left === 0 ? 'no slots left' : `${left} slot${left === 1 ? '' : 's'} left`)
  return parts.join(' · ')
}

/** Move an item within the grid — used by reordering and "make cover". */
export function reorderMedia(
  media: ListingMedia[],
  from: number,
  to: number
): ListingMedia[] {
  if (from === to || from < 0 || to < 0 || from >= media.length || to >= media.length) {
    return media
  }
  const next = [...media]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * The cover is the first image — never a video, since a still frame is what
 * cards and search results render.
 */
export const coverOf = (media: ListingMedia[]): ListingMedia | undefined =>
  media.find((m) => m.kind === 'image')

export function makeCover(media: ListingMedia[], id: string): ListingMedia[] {
  const index = media.findIndex((m) => m.id === id)
  if (index <= 0 || media[index].kind !== 'image') return media
  return reorderMedia(media, index, 0)
}
