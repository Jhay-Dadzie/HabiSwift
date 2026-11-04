import React, { useCallback, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { ArrowUpRight, Bell, ChevronRight, Eye, Mail, Plus } from 'lucide-react-native'
import { Image } from 'expo-image'
import { ThemedText } from '@/components/themed-text'
import { Colors } from '@/constants/theme'
import { loadJSON, StorageKeys } from '@/utils/storage'
import { useAuth } from '@/contexts/AuthContext'
import { ListingMedia } from '@/types/media'

const profileImage = require('../../assets/images/figma-listing/dashboard-profile.png')
const propertyImage = require('../../assets/images/figma-listing/dashboard-property.png')
const propertyImageTwo = require('../../assets/images/figma-listing/dashboard-property-2.png')
type DashboardListing = { id: string; title: string; location: string; rent: string; media?: ListingMedia[] }

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [listings, setListings] = useState<DashboardListing[]>([])
  useFocusEffect(useCallback(() => { loadJSON<DashboardListing[]>(StorageKeys.landlordListings, []).then(setListings) }, []))
  const displayName = user?.fullName?.split(' ')[0] || 'Alex'
  const visibleListings = listings.length ? listings.slice(0, 2) : [{ id: 'sample-1', title: 'The Glass House', location: 'Sunset Blvd, Los Angeles', rent: '3200' }, { id: 'sample-2', title: 'Urban Loft Unit 4B', location: 'Chelsea, New York City', rent: '4500' }]
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Image source={profileImage} contentFit="cover" style={styles.avatar} />
            <View>
              <ThemedText style={styles.hello}>HELLO</ThemedText>
              <ThemedText style={styles.name}>{displayName === 'Alex' ? 'Alex Rivera' : user?.fullName}</ThemedText>
            </View>
          </View>
          <Pressable style={styles.notification}>
            <Bell size={19} color="#1E293B" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.revenueCard}>
          <View style={styles.revenueRow}>
            <ThemedText style={styles.revenueLabel}>Estimated Revenue</ThemedText>
            <ArrowUpRight size={21} color="#fff" />
          </View>
          <ThemedText style={styles.revenueValue}>$12,450</ThemedText>

          <View style={styles.revenuePill}>
            <ThemedText style={styles.revenuePillText}>+12.5% vs last month</ThemedText>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat label="Total Views" value="12.4k" change="+15%" />
          <Stat label="Interested" value="42" change="+8%" />
        </View>

        {/* Add property buttton */}
        <Pressable onPress={() => router.push('/create-listing')} style={styles.addProperty}>
          <Plus size={21} color="#fff" />
          <ThemedText style={styles.addPropertyText}>Add New Property</ThemedText>
        </Pressable>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Active Listings</ThemedText>
          <Pressable onPress={() => router.push('/(landlordScreens)/listings')}>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </Pressable>
        </View>

        <View style={styles.listings}>
          {
            visibleListings.map((listing, index) => <ListingCard 
                key={listing.id} 
                listing={listing} 
                source={listing.media?.[0]?.uri ? { uri: listing.media[0].uri } : index === 0 ? propertyImage : propertyImageTwo} 
              />
            )
          }
        </View>

        <View style={[styles.sectionHeader, styles.activityHeader]}>
          <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
        </View>
        <View style={styles.activity}>
          <Activity icon={<Mail size={18} color={Colors.light.tint} />} 
            text={
              <>
                <ThemedText style={styles.activityText}>New inquiry from Sarah Chen for </ThemedText>
                <ThemedText style={styles.activityStrong}>The Glass House</ThemedText>
              </>
            } 
            time="2 minutes ago" 
          />

          {/* New views notification */}
          <Activity icon={<Eye size={18} color="#64748B" />} 
            text={
              <>
                <ThemedText style={styles.activityText}>Your listing </ThemedText>
                <ThemedText style={styles.activityStrong}>Urban Loft</ThemedText>
                <ThemedText style={styles.activityText}> reached 1,000 views!</ThemedText>
              </>
            } 
            time="1 hour ago" 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
function Stat({ label, value, change }: { label: string; value: string; change: string }) { return <View style={styles.stat}><ThemedText style={styles.statLabel}>{label}</ThemedText><View style={styles.statBottom}><ThemedText style={styles.statValue}>{value}</ThemedText><ThemedText style={styles.change}>{change}</ThemedText></View></View> }
function ListingCard({ listing, source }: { listing: DashboardListing; source: any }) { return <View style={styles.listingCard}><Image source={source} contentFit="cover" style={styles.listingImage} /><View style={styles.listingInfo}><ThemedText numberOfLines={1} style={styles.listingTitle}>{listing.title}</ThemedText><ThemedText numberOfLines={1} style={styles.listingLocation}>{listing.location}</ThemedText><View style={styles.listingBottom}><ThemedText style={styles.listingRent}>{'$' + Number(listing.rent || 0).toLocaleString()}/mo</ThemedText><View style={styles.dividerDot} /><ThemedText style={styles.applicants}>{listing.id.startsWith('sample') ? '8 Applicants' : 'New'}</ThemedText></View></View><ChevronRight size={17} color="#94A3B8" /></View> }
function Activity({ icon, text, time }: { icon: React.ReactNode; text: React.ReactNode; time: string }) { return <View style={styles.activityItem}><View style={styles.activityIcon}>{icon}</View><View style={styles.activityCopy}><View style={styles.activityLine}>{text}</View><ThemedText style={styles.activityTime}>{time}</ThemedText></View></View> }
const styles = StyleSheet.create({
  screen: { flex: 1,backgroundColor: '#F8FAFC' }, 
  content: { paddingHorizontal: 24, paddingBottom: 24 }, 
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 16, 
    paddingBottom: 16 
  }, 
  identity: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  }, 
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#E2E8F0' 
  }, 
  hello: { 
    color: '#64748B', 
    fontSize: 10, 
    lineHeight: 15, 
    letterSpacing: 1, 
    fontWeight: '800' 
  }, 
  name: { 
    color: '#1E293B', 
    fontSize: 18, 
    lineHeight: 23, 
    fontWeight: '800' 
  }, 
  notification: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#F1F5F9', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }, 
  notificationDot: { 
    position: 'absolute', 
    right: 10, 
    top: 9, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: Colors.light.tint, 
    borderWidth: 2, 
    borderColor: '#fff' 
  },
  revenueCard: { 
    backgroundColor: Colors.light.tint, 
    borderRadius: 16, 
    padding: 20, 
    minHeight: 118, 
    shadowColor: Colors.light.tint, 
    shadowOpacity: 0.2, 
    shadowRadius: 12, 
    elevation: 5 }, 
  revenueRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  }, 
  revenueLabel: { 
    color: '#fff', 
    opacity: 0.9, 
    fontSize: 14 
  }, 
  revenueValue: { 
    color: '#fff', 
    fontSize: 30, 
    lineHeight: 36, 
    fontWeight: '800', 
    marginTop: 3 
  }, 
  revenuePill: { 
    alignSelf: 'flex-start', 
    marginTop: 4, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 999, 
    paddingHorizontal: 8, 
    paddingVertical: 2 
  }, 
  revenuePillText: { color: '#fff', fontSize: 10 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 16 }, 
  stat: { flex: 1, 
    height: 78, 
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#F1F5F9', 
    justifyContent: 'space-between' 
  }, 
  statLabel: { color: '#64748B', fontSize: 12 }, 
  statBottom: { flexDirection: 'row', alignItems: 'baseline', gap: 5 }, 
  statValue: { color: '#1E293B', fontSize: 20, fontWeight: '800' }, 
  change: { color: '#059669', fontSize: 10, fontWeight: '700' }, 
  addProperty: { height: 56, 
    marginTop: 23, 
    borderRadius: 24, 
    backgroundColor: Colors.light.tint, 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexDirection: 'row', 
    gap: 8, shadowColor: Colors.light.tint, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
    elevation: 4 
  }, 
  addPropertyText: { color: '#fff', fontSize: 16, fontWeight: '800' }, 
  sectionHeader: { 
    marginTop: 32, 
    marginBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  }, 
  sectionTitle: { color: '#1E293B', fontSize: 18, lineHeight: 28, fontWeight: '800' }, 
  viewAll: { color: Colors.light.tint, fontSize: 12, fontWeight: '700' }, 
  listings: { gap: 12 }, 
  listingCard: { 
    minHeight: 100, 
    padding: 12, 
    borderRadius: 16, 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#F1F5F9', 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  }, 
  listingImage: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#E2E8F0' }, 
  listingInfo: { flex: 1, gap: 3 }, 
  listingTitle: { color: '#1E293B', fontSize: 14, lineHeight: 20, fontWeight: '800' }, 
  listingLocation: { color: '#64748B', fontSize: 12, lineHeight: 16 }, 
  listingBottom: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 3 }, 
  listingRent: { color: Colors.light.tint, fontSize: 12, fontWeight: '800' }, 
  dividerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#94A3B8' }, 
  applicants: { color: '#059669', fontSize: 10, fontWeight: '700' },
  activityHeader: { marginTop: 29, marginBottom: 9 }, 
  activity: { gap: 18 }, 
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, 
  activityIcon: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#E9E8F7', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }, 
  activityCopy: { flex: 1, gap: 3 }, activityLine: { flexDirection: 'row', flexWrap: 'wrap' }, 
  activityText: { color: '#475569', fontSize: 14, lineHeight: 20 }, 
  activityStrong: { color: '#1E293B', fontSize: 14, lineHeight: 20, fontWeight: '800' }, 
  activityTime: { color: '#94A3B8', fontSize: 10, lineHeight: 15 },
})
