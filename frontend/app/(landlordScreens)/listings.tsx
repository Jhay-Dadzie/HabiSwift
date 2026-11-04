import React, { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { Archive, ChevronRight, Edit3, Eye, MoreVertical, Plus, Video } from 'lucide-react-native'
import { Image } from 'expo-image'

import { ThemedText } from '@/components/themed-text'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { Colors } from '@/constants/theme'
import { loadJSON, StorageKeys } from '@/utils/storage'
import { ListingMedia } from '@/types/media'

type DraftListing = { id: string; title: string; type: string; location: string; rent: string; media: ListingMedia[]; status: 'published'; createdAt: string }

export default function Listings() {
  const theme = usePageThemeRender()
  const router = useRouter()
  const [listings, setListings] = useState<DraftListing[]>([])
  useFocusEffect(useCallback(() => { loadJSON<DraftListing[]>(StorageKeys.landlordListings, []).then(setListings) }, []))

  return <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.background }]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View><ThemedText style={[styles.heading, { color: theme.oppositeTextColor }]}>Your listings</ThemedText><ThemedText style={{ color: theme.secondaryFontColor, marginTop: 4 }}>{listings.length} published home{listings.length === 1 ? '' : 's'}</ThemedText></View><Pressable onPress={() => router.push('/create-listing')} style={[styles.addButton, { backgroundColor: Colors.light.tint }]}><Plus size={18} color="#fff" /><ThemedText style={styles.addText}>Add new</ThemedText></Pressable></View>
      {listings.length === 0 ? <View style={[styles.empty, { borderColor: theme.borderColor, backgroundColor: theme.cardBackground }]}><View style={[styles.emptyIcon, { backgroundColor: theme.secondaryBackground }]}><Archive size={24} color={theme.icon} /></View><ThemedText style={[styles.emptyTitle, { color: theme.oppositeTextColor }]}>Your listings will live here</ThemedText><ThemedText style={{ color: theme.secondaryFontColor, textAlign: 'center', lineHeight: 20 }}>Add photos, set your rent, and publish your first home.</ThemedText><Pressable onPress={() => router.push('/create-listing')} style={[styles.primaryButton, { backgroundColor: Colors.light.tint }]}><Plus size={17} color="#fff" /><ThemedText style={styles.primaryText}>Create listing</ThemedText></Pressable></View> : listings.map((listing) => <ListingRow key={listing.id} listing={listing} theme={theme} />)}
      {listings.length > 0 && <Pressable onPress={() => router.push('/create-listing')} style={[styles.secondaryCta, { borderColor: theme.borderColor, backgroundColor: theme.cardBackground }]}><Plus size={18} color={theme.link} /><ThemedText style={{ color: theme.link, fontWeight: '800' }}>Add another listing</ThemedText></Pressable>}
    </ScrollView>
  </SafeAreaView>
}

function ListingRow({ listing, theme }: { listing: DraftListing; theme: ReturnType<typeof usePageThemeRender> }) {
  const cover = listing.media.find((item) => item.kind === 'image')
  const videoCount = listing.media.filter((item) => item.kind === 'video').length
  return <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}><View style={styles.row}><View style={styles.cover}>{cover ? <Image source={{ uri: cover.uri }} contentFit="cover" style={StyleSheet.absoluteFill} /> : <Archive size={22} color={theme.icon} />}<View style={styles.liveBadge}><ThemedText style={styles.liveText}>LIVE</ThemedText></View></View><View style={styles.rowInfo}><ThemedText numberOfLines={1} style={[styles.listingTitle, { color: theme.oppositeTextColor }]}>{listing.title}</ThemedText><ThemedText numberOfLines={1} style={{ color: theme.secondaryFontColor, marginTop: 4 }}>{listing.location}</ThemedText><ThemedText style={{ color: theme.oppositeTextColor, fontWeight: '800', marginTop: 9 }}>GHS {Number(listing.rent || 0).toLocaleString()}<ThemedText style={{ color: theme.secondaryFontColor, fontWeight: '500' }}> / month</ThemedText></ThemedText></View><Pressable hitSlop={10}><MoreVertical size={19} color={theme.icon} /></Pressable></View><View style={[styles.metaRow, { borderTopColor: theme.borderColor }]}><View style={styles.meta}><Eye size={15} color={theme.icon} /><ThemedText style={{ color: theme.secondaryFontColor, fontSize: 12 }}>0 views</ThemedText></View><View style={styles.meta}><Video size={15} color={theme.icon} /><ThemedText style={{ color: theme.secondaryFontColor, fontSize: 12 }}>{videoCount} video{videoCount === 1 ? '' : 's'}</ThemedText></View><View style={{ flex: 1 }} /><Edit3 size={15} color={theme.link} /><ThemedText style={{ color: theme.link, fontSize: 12, fontWeight: '700' }}>Edit</ThemedText><ChevronRight size={16} color={theme.link} /></View></View>
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, content: { paddingHorizontal: 18, paddingBottom: 34 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 }, heading: { fontSize: 24, fontWeight: '800' }, addButton: { borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 10 }, addText: { color: '#fff', fontSize: 13, fontWeight: '800' }, empty: { alignItems: 'center', borderWidth: 1, borderRadius: 20, padding: 28, marginTop: 36, gap: 8 }, emptyIcon: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginBottom: 5 }, emptyTitle: { fontSize: 18, fontWeight: '800' }, primaryButton: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, marginTop: 10 }, primaryText: { color: '#fff', fontWeight: '800' }, card: { borderWidth: 1, borderRadius: 18, padding: 10, marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 11 }, cover: { width: 82, height: 82, borderRadius: 13, backgroundColor: '#E2E8F0', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, liveBadge: { position: 'absolute', bottom: 6, left: 6, borderRadius: 5, backgroundColor: '#16A34A', paddingHorizontal: 5, paddingVertical: 3 }, liveText: { color: '#fff', fontSize: 8, fontWeight: '800' }, rowInfo: { flex: 1 }, listingTitle: { fontSize: 16, fontWeight: '800' }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, marginTop: 10, paddingTop: 10 }, meta: { flexDirection: 'row', alignItems: 'center', gap: 4 }, secondaryCta: { minHeight: 52, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, marginTop: 4 },
})
