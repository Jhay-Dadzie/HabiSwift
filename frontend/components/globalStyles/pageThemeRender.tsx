import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'

/**
 * Semantic colour tokens for a screen.
 *
 * Both palettes are built once at module load and the hook just indexes into
 * them. That matters: this object is passed as a prop and used as a
 * `useMemo`/`React.memo` dependency all over the app, so returning a fresh
 * object literal on every render (as this used to) invalidated every
 * downstream memo and forced full list re-renders on each keystroke.
 */

export interface PageTheme {
  oppositeTextColor: string
  borderColor: string
  fontColor: string
  secondaryFontColor: string
  label: string
  link: string
  background: string
  /** Surface for cards sitting on top of `background`. */
  cardBackground: string
  secondaryBackground: string
  icon: string
  iconContainer: string
  tipsBackground: string
  tipsTextColor: string
  /** Placeholder block shown while an image loads. */
  skeleton: string
  /** Scrim behind floating controls sitting on photography. */
  overlay: string
  danger: string
  success: string
  star: string
}

const PALETTES: Record<'light' | 'dark', PageTheme> = {
  light: {
    oppositeTextColor: Colors.light.contrastColor,
    borderColor: Colors.light.borderColor,
    fontColor: Colors.light.text,
    secondaryFontColor: '#334155',
    label: '#334155',
    link: Colors.light.contrastColor,
    background: Colors.light.background,
    /** Surface for cards sitting on top of `background`. */
    cardBackground: '#FFFFFF',
    secondaryBackground: '#F8FAFC',
    icon: Colors.light.icon,
    iconContainer: '#E2E8F0',
    tipsBackground: '#F0FDF4',
    tipsTextColor: '#166534',
    /** Placeholder block shown while an image loads. */
    skeleton: '#E2E8F0',
    /** Scrim behind floating controls sitting on photography. */
    overlay: 'rgba(255,255,255,0.9)',
    danger: '#EF4444',
    success: '#16A34A',
    star: '#EAB308',
  },
  dark: {
    oppositeTextColor: Colors.dark.contrastColor,
    borderColor: Colors.dark.borderColor,
    fontColor: Colors.dark.text,
    secondaryFontColor: '#CBD5E1',
    label: Colors.dark.text,
    link: Colors.dark.tint,
    background: Colors.dark.background,
    cardBackground: '#111C33',
    secondaryBackground: '#1E293B',
    icon: Colors.dark.icon,
    iconContainer: '#1E293B',
    tipsBackground: '#14351F',
    tipsTextColor: '#10B981',
    skeleton: '#1E293B',
    overlay: 'rgba(15,23,42,0.85)',
    danger: '#F87171',
    success: '#34D399',
    star: '#FACC15',
  },
}

export default function usePageThemeRender(): PageTheme {
  const colorScheme = useColorScheme()
  return PALETTES[colorScheme === 'dark' ? 'dark' : 'light']
}
