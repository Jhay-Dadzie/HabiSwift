import { Redirect } from 'expo-router'

/** Legacy route kept so older deep links do not show the retired role picker. */
export default function Role() {
  return <Redirect href="/auth/seekerSignUp" />
}
