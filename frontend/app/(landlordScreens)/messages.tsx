import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Inbox, MessageCircle } from 'lucide-react-native'
import { ThemedText } from '@/components/themed-text'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'

export default function LandlordMessages() {
  const theme = usePageThemeRender()
  return <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}><ScrollView contentContainerStyle={styles.content}><ThemedText style={[styles.title, { color: theme.oppositeTextColor }]}>Messages</ThemedText><ThemedText style={{ color: theme.secondaryFontColor, marginTop: 5 }}>Keep conversations with prospective tenants in one place.</ThemedText><View style={[styles.empty, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}><View style={[styles.icon, { backgroundColor: theme.secondaryBackground }]}><Inbox size={25} color={theme.icon} /></View><ThemedText style={[styles.emptyTitle, { color: theme.oppositeTextColor }]}>Your inbox is quiet</ThemedText><ThemedText style={{ color: theme.secondaryFontColor, textAlign: 'center', lineHeight: 20 }}>When a tenant has a question about one of your homes, their message will appear here.</ThemedText><View style={styles.tip}><MessageCircle size={17} color={theme.link} /><ThemedText style={{ color: theme.link, fontSize: 12, fontWeight: '700' }}>Tip: add clear photos to invite more enquiries</ThemedText></View></View></ScrollView></SafeAreaView>
}
const styles = StyleSheet.create({ screen: { flex: 1 }, content: { padding: 18 }, title: { fontSize: 26, fontWeight: '900', marginTop: 10 }, empty: { borderRadius: 20, borderWidth: 1, alignItems: 'center', padding: 26, marginTop: 34, gap: 9 }, icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }, emptyTitle: { fontSize: 18, fontWeight: '800' }, tip: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, padding: 10, borderRadius: 12, backgroundColor: '#F0EEFF' } })
