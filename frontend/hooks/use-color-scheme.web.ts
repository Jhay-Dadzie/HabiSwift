/**
 * On web the theme still comes from `ThemeContext` — the provider already
 * resolves the 'system' preference against `prefers-color-scheme`, so reading
 * the OS scheme directly here (as this file used to) would silently ignore the
 * user's saved choice and hand screens a `null` scheme.
 */
export { useColorScheme } from './use-color-scheme'
