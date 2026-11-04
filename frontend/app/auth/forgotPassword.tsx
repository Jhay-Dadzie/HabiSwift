import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Mail } from 'lucide-react-native'
import { ThemedText } from '@/components/themed-text'
import Button from '@/components/button'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'

export default function ForgotPassword() {
  const router = useRouter(); const theme = usePageThemeRender(); const [email, setEmail] = useState('')
  const submit = () => router.replace('/(tenantScreens)')
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}><KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.content}><Pressable onPress={() => router.back()} hitSlop={10} style={[styles.back, { borderColor: theme.borderColor, backgroundColor: theme.cardBackground }]}><ArrowLeft size={19} color={theme.oppositeTextColor} /></Pressable><View style={styles.intro}><ThemedText style={[styles.title, { color: theme.oppositeTextColor }]}>Reset your password</ThemedText><ThemedText style={{ color: theme.secondaryFontColor, lineHeight: 21, marginTop: 9 }}>Enter the email attached to your account.</ThemedText></View><ThemedText style={[styles.label, { color: theme.label }]}>Email address</ThemedText><View style={[styles.inputWrap, { borderColor: theme.borderColor, backgroundColor: theme.cardBackground }]}><Mail size={19} color={theme.icon} /><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.icon} autoCapitalize="none" keyboardType="email-address" style={[styles.input, { color: theme.oppositeTextColor }]} /></View><Button action={submit}><ThemedText type="placeholderText">Continue to home</ThemedText></Button><Pressable onPress={() => router.replace('/auth')} style={styles.backToLogin}><ThemedText style={{ color: theme.link, fontWeight: '800' }}>Back to sign in</ThemedText></Pressable></View></KeyboardAvoidingView></SafeAreaView>
}
const styles = StyleSheet.create({ screen: { flex: 1 }, content: { padding: 22 }, back: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, intro: { marginTop: 52, marginBottom: 28 }, title: { fontSize: 28, fontWeight: '900' }, label: { fontSize: 13, fontWeight: '700', marginBottom: 7 }, inputWrap: { minHeight: 54, borderRadius: 15, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }, input: { flex: 1, fontSize: 15, paddingVertical: 14 }, backToLogin: { alignSelf: 'center', marginTop: 24 } })
