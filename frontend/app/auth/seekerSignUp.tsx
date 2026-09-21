import React, { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Check, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react-native'

import { ThemedText } from '@/components/themed-text'
import Button from '@/components/button'
import { Colors } from '@/constants/theme'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { AuthError, homeRouteFor, useAuth } from '@/contexts/AuthContext'
import { assessPassword, validateConfirmPassword, validateEmail, validateFullName, validatePhone, validatePassword } from '@/utils/validation'

export default function SeekerSignUp() {
  const router = useRouter(); const theme = usePageThemeRender(); const { signUp, pending } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' }); 
  const [visible, setVisible] = useState(false); 
  const [agreed, setAgreed] = useState(false); const [error, setError] = useState('')
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async () => {
    const errors = [
      validateFullName(form.fullName), 
      validateEmail(form.email), validatePhone(form.phone), 
      validatePassword(form.password), 
      validateConfirmPassword(form.password)(form.confirm)
    ]
    if (errors.some(Boolean)) { setError(errors.find(Boolean) || 'Check your details'); return }
    if (!agreed) { setError('Accept the terms to continue'); return }
    setError('')
    try { 
      const user = await signUp({ 
        fullName: form.fullName, 
        email: form.email, 
        phone: form.phone, 
        password: form.password 
      }); 
      router.replace(homeRouteFor(user.role)) 
    } catch (err) {  
      setError(err instanceof AuthError ? err.message : 'Unable to create your account right now') 
    }
  }
  const password = assessPassword(form.password)
  return (
  <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()}>
            <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Back</ThemedText>
          </Pressable>
        </View>

        <View style={styles.intro}>
          <ThemedText style={[styles.title, { color: theme.oppositeTextColor }]}>Find your next home</ThemedText>
          <ThemedText style={{ color: theme.secondaryFontColor, marginTop: 8 }}>Create an account to save homes and message landlords.</ThemedText>
        </View>

        {/* Input fields */}
        <Field label="Full name" value={form.fullName} 
          onChangeText={(v) => update('fullName', v)} 
          placeholder="Ama Mensah" 
          theme={theme} 
          icon={<UserRound size={19} 
          color={theme.icon} />} 
          autoCapitalize="words" 
        />
        <Field label="Email address" 
          value={form.email} 
          onChangeText={(v) => update('email', v)} 
          placeholder="ama@example.com" 
          theme={theme} 
          icon={<Mail size={19} 
          color={theme.icon} />} 
          autoCapitalize="none" 
        />
        <Field label="Phone number" 
          value={form.phone} 
          onChangeText={(v) => update('phone', v)} 
          placeholder="024 123 4567" 
          theme={theme} 
          icon={<Phone size={19} 
          color={theme.icon} />} 
          keyboardType="phone-pad" 
        />
        <PasswordField label="Password" 
          value={form.password} 
          onChangeText={(v) => update('password', v)} 
          visible={visible} 
          onToggle={() => setVisible((value) => !value)} 
          theme={theme} 
        />
        
        {/* Password strength */}
        <View style={styles.strength}>
          <View style={styles.bars}>
            {[0, 1, 2].map((index) => <View key={index} style={[styles.bar, { backgroundColor: index < password.score ? (password.strength === 'strong' ? '#16A34A' : '#F59E0B') : theme.borderColor }]} />)}
          </View>
          <ThemedText style={{ color: theme.secondaryFontColor, fontSize: 12 }}>
            {form.password ? password.hint : 'Use 8+ characters with a number'}
          </ThemedText>
        </View>

        {/* Confirm Password */}
        <PasswordField label="Confirm password" 
          value={form.confirm} 
          onChangeText={(v) => update('confirm', v)} 
          visible={visible} onToggle={() => setVisible((value) => !value)} 
          theme={theme} 
        />
        
        <Pressable onPress={() => setAgreed((value) => !value)} style={styles.agreement}>
          <View style={[styles.checkbox, { 
              borderColor: agreed ? Colors.light.tint : theme.borderColor, 
              backgroundColor: agreed ? Colors.light.tint : theme.cardBackground }
            ]}
          >
            {agreed && <Check size={14} color="#fff" />}
          </View>
          <ThemedText style={{ color: theme.secondaryFontColor, flex: 1, fontSize: 13, lineHeight: 19 }}>
            I agree to the HabiSwift terms and privacy policy.
          </ThemedText>
        </Pressable>

        {
          error ? <ThemedText style={[styles.error, { color: theme.danger }]}>{error}</ThemedText> : null
        }

        <Button action={submit} disabled={pending}>
          {pending ? <ActivityIndicator color="#fff" /> : <ThemedText type="placeholderText">Create account</ThemedText>}
        </Button>
        <View style={styles.footer}>
          <ThemedText style={{ color: theme.secondaryFontColor }}>Already have an account?</ThemedText>
          <Pressable onPress={() => router.replace('/auth')}>
            <ThemedText style={{ color: theme.link, fontWeight: '800' }}> Sign in</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>)
}

// Input fields function
function Field({ label, value, onChangeText, placeholder, theme, icon, autoCapitalize, keyboardType }: 
  { label: string; 
    value: string; 
    onChangeText: (value: string) => void; 
    placeholder: string; 
    theme: ReturnType<typeof usePageThemeRender>; 
    icon: React.ReactNode; 
    autoCapitalize?: 'none' | 'words'; 
    keyboardType?: 'default' | 'phone-pad' 
  }
) { 
  return (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: theme.label }]}>{label}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
        {icon}
        <TextInput value={value} 
          onChangeText={onChangeText} 
          placeholder={placeholder} 
          placeholderTextColor={theme.icon} 
          autoCapitalize={autoCapitalize} 
          keyboardType={keyboardType} 
          style={[styles.input, { color: theme.oppositeTextColor }]} 
        />
      </View>
    </View>

  ) 
}

// Password field function
function PasswordField({ label, value, onChangeText, visible, onToggle, theme }: 
  { label: string; value: string; 
    onChangeText: (value: string) => void; 
    visible: boolean; 
    onToggle: () => void; theme: ReturnType<typeof usePageThemeRender> 
  }
) { 
  return (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: theme.label }]}>{label}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
        <LockKeyhole size={19} color={theme.icon} />
        <TextInput value={value} 
          onChangeText={onChangeText} 
          placeholder="Create a password" 
          placeholderTextColor={theme.icon} 
          secureTextEntry={!visible} 
          style={[styles.input, { color: theme.oppositeTextColor }]} 
        />
        <Pressable onPress={onToggle} hitSlop={8}>
          {visible ? <EyeOff size={19} color={theme.icon} /> : <Eye size={19} color={theme.icon} />}
        </Pressable>
      </View>
    </View> 
  )
}

//Stylesheet
const styles = StyleSheet.create({
  screen: { flex: 1 }, 
  content: { paddingHorizontal: 22, paddingBottom: 34 }, 
  top: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 12 
  }, 
  intro: { marginTop: 35, marginBottom: 25 }, 
  title: { fontSize: 28, fontWeight: '900' }, 
  field: { marginBottom: 15 }, 
  label: { fontSize: 13, fontWeight: '700', marginBottom: 7 }, 
  inputWrap: { minHeight: 53, 
    borderRadius: 15, 
    borderWidth: 1, 
    paddingHorizontal: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  }, 
  input: { flex: 1, fontSize: 15, paddingVertical: 13 }, 
  strength: { marginTop: -5, marginBottom: 14, gap: 6 }, 
  bars: { flexDirection: 'row', gap: 5 }, 
  bar: { height: 4, borderRadius: 2, flex: 1 }, 
  agreement: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginVertical: 8 
  }, 
  checkbox: { 
    width: 22, 
    height: 22, 
    borderWidth: 1, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center' 
  }, 
  error: { fontSize: 13, lineHeight: 18, marginVertical: 10 }, 
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 24 
  } 
})
