import { Redirect } from 'expo-router'

/**
 * Legacy public URL. Account creation now always starts as a tenant; users
 * can apply to become landlords from their profile after signing in.
 */
export default function LandlordSignUp() {
  return <Redirect href="/auth/seekerSignUp" />
}
