import React, { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Eye, EyeOff, LockKeyhole, Mail, Phone } from 'lucide-react-native'

import { ThemedText } from '@/components/themed-text'
import Button from '@/components/button'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { useAuth, homeRouteFor, AuthError } from '@/contexts/AuthContext'
import { validateEmailOrPhone, validatePassword } from '@/utils/validation'

export default function Login() {
  const router = useRouter()
  const theme = usePageThemeRender()
  const { signIn, pending } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const identifierError = validateEmailOrPhone(identifier)
    const passwordError = validatePassword(password)
    if (identifierError || passwordError) { setError(identifierError || passwordError || 'Check your details'); return }
    setError('')
    try { const user = await signIn(identifier, password); router.replace(homeRouteFor(user.role)) }
    catch (err) { setError(err instanceof AuthError ? err.message : 'Unable to sign in right now') }
  }

  return (
  <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={[styles.brandMark, { backgroundColor: Colors.light.tint }]}>
            <ThemedText style={styles.brandMarkText}>H</ThemedText>
          </View>
          <ThemedText style={[styles.brandText, { color: theme.oppositeTextColor }]}>HabiSwift</ThemedText>
        </View>

        <View style={styles.intro}>
          <ThemedText style={[styles.title, { color: theme.oppositeTextColor }]}>Welcome back</ThemedText>
          <ThemedText style={{ color: theme.secondaryFontColor, marginTop: 8 }}>Sign in to continue finding or managing your next home.</ThemedText>
        </View>

        <Field label="Email or phone number" value={identifier} 
          onChangeText={setIdentifier} placeholder="you@example.com" theme={theme} 
          icon={identifier.includes('@') ? <Mail size={19} 
          color={theme.icon} 
        /> : 
        <Phone size={19} color={theme.icon} />} autoCapitalize="none" />

        <View style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.label }]}>Password</ThemedText>
          <View style={[styles.inputWrap, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <LockKeyhole size={19} color={theme.icon} />
            <TextInput 
              value={password} 
              onChangeText={setPassword} 
              placeholder="Enter your password" placeholderTextColor={theme.icon} 
              secureTextEntry={!visible} 
              style={[styles.input, { color: theme.oppositeTextColor }]} 
            />
            <Pressable onPress={() => setVisible((value) => !value)} hitSlop={8}>
              {visible ? <EyeOff size={19} color={theme.icon} /> : <Eye size={19} color={theme.icon} />}
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push('/auth/forgotPassword')} style={styles.forgot}>
          <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Forgot password?</ThemedText>
        </Pressable>
        
        {
          error ? <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText> : null
        }

        <Button action={submit} disabled={pending}>
          {pending ? <ActivityIndicator color="#fff" /> : <ThemedText type="placeholderText">Sign in</ThemedText>}
        </Button>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: theme.borderColor }]} />
          <ThemedText style={{ color: theme.secondaryFontColor, fontSize: 12 }}>NEW TO HABISWIFT?</ThemedText>
          <View style={[styles.line, { backgroundColor: theme.borderColor }]} />
        </View>

        <Pressable onPress={() => router.replace('/(onboarding)/role')} 
          style={[styles.outlineButton, { borderColor: theme.borderColor, backgroundColor: theme.cardBackground }]}
        >
          <ThemedText style={{ color: theme.oppositeTextColor, fontWeight: '800' }}>Create an account</ThemedText>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  )
}

function Field({ label, value, onChangeText, placeholder, theme, icon, autoCapitalize }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; theme: ReturnType<typeof usePageThemeRender>; icon: React.ReactNode; autoCapitalize?: 'none' | 'sentences' }) { return <View style={styles.field}><ThemedText style={[styles.label, { color: theme.label }]}>{label}</ThemedText><View style={[styles.inputWrap, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>{icon}<TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.icon} autoCapitalize={autoCapitalize} keyboardType={label.includes('phone') ? 'phone-pad' : 'email-address'} style={[styles.input, { color: theme.oppositeTextColor }]} /></View></View> }

const styles = StyleSheet.create({
  screen: { flex: 1 }, 
  content: { 
    paddingHorizontal: 22, 
    paddingBottom: 34 
  }, 
  brand: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 9, 
    marginTop: 18 
  }, 
  brandMark: { 
    width: 34, 
    height: 34, 
    borderRadius: 11, 
    alignItems: 'center', 
    justifyContent: 'center' 
  }, 
  brandMarkText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '900' 
  }, 
  brandText: { 
    fontSize: 18, 
    fontWeight: '900' 
  }, 
  intro: { 
    marginTop: 52, 
    marginBottom: 30 
  }, 
  title: { 
    fontSize: 30, 
    fontWeight: '900' 
  }, 
  field: { marginBottom: 17 }, 
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    marginBottom: 7 
  }, 
  inputWrap: { 
    minHeight: 54, 
    borderRadius: 15, 
    borderWidth: 1, 
    paddingHorizontal: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  }, 
  input: { 
    flex: 1, 
    fontSize: 15, 
    paddingVertical: 14 
  }, 
  forgot: { 
    alignSelf: 'flex-end', 
    marginTop: -2, 
    marginBottom: 16 
  }, 
  error: { 
    fontSize: 13, 
    marginBottom: 12, 
    lineHeight: 18 
  }, 
  divider: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginVertical: 26 
  }, 
  line: { 
    height: 1, 
    flex: 1 
  }, 
  outlineButton: { 
    minHeight: 54, 
    borderRadius: 27, 
    borderWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  }
})
