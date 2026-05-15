import { StyleSheet, ScrollView, View, TouchableOpacity, Switch, Image } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import React, { useState } from 'react'
import usePageThemeRender from '@/components/globalStyles/pageThemeRender'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useTheme } from '@/contexts/ThemeContext'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { PageStyles } from '@/components/globalStyles/pageStyles'

interface MenuItem {
  id: string
  icon: string
  iconSet: 'material' | 'ionicons'
  title: string
  subtitle?: string
  hasToggle?: boolean
  hasArrow?: boolean
}

export default function Profile() {
  const theme = usePageThemeRender()
  const colorScheme = useColorScheme()
  const { toggleTheme } = useTheme()
  const colors = Colors[colorScheme ?? 'light']
  const isLight = colorScheme === 'light'

  const [landlordToggle, setLandlordToggle] = useState(false)

  const accountMenuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: 'account-circle',
      iconSet: 'material',
      title: 'My Profile',
      hasArrow: true,
    },
    {
      id: 'settings',
      icon: 'cog',
      iconSet: 'material',
      title: 'My Settings',
      hasArrow: true,
    },
  ]

  const preferencesMenuItems: MenuItem[] = [
    {
      id: 'darkmode',
      icon: 'moon',
      iconSet: 'ionicons',
      title: 'Dark Mode',
      hasToggle: true,
    },
  ]

  const supportMenuItems: MenuItem[] = [
    {
      id: 'help',
      icon: 'help-box',
      iconSet: 'material',
      title: 'Help Center',
      hasArrow: true,
    },
    {
      id: 'about',
      icon: 'information-circle',
      iconSet: 'ionicons',
      title: 'About Haven',
      hasArrow: true,
    },
  ]

  const renderMenuItem = (item: MenuItem, isLast: boolean) => (
    <ThemedView key={item.id}>
      <TouchableOpacity
        style={[
          styles.menuItem,
          {
            backgroundColor: theme.secondaryBackground,
            borderBottomColor: isLast ? 'transparent' : colors.borderColor,
            borderBottomWidth: isLast ? 0 : 1,
          },
        ]}
      >
        <View style={styles.menuItemLeft}>
          {item.iconSet === 'material' ? (
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={colors.contrastColor}
            />
          ) : (
            <Ionicons
              name={item.icon as any}
              size={24}
              color={colors.contrastColor}
            />
          )}
          <ThemedText style={[styles.menuItemTitle]}>
            {item.title}
          </ThemedText>
        </View>
        {item.hasToggle ? (
          <Switch
            value={item.id === 'darkmode' ? !isLight : false}
            onValueChange={(value) => {
              if (item.id === 'darkmode') {
                toggleTheme()
              }
            }}
            thumbColor={isLight ? '#fff' : '#f0f0f0'}
            trackColor={{
              false: isLight ? '#e2e8f0' : '#334155',
              true: isLight ? '#dbeafe' : '#667eea',
            }}
          />
        ) : item.hasArrow ? (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.fontColor}
          />
        ) : null}
      </TouchableOpacity>
    </ThemedView>
  )

  return (
    <ThemedView style={PageStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: isLight
                  ? '#FCD34D'
                  : '#D97706',
              },
            ]}
          >
            <Image
              source={require('@/assets/images/profile-avatar.png')}
              style={styles.avatar}
            />
            {/* Verification Badge */}
            <View style={styles.verificationBadge}>
              <Ionicons name="checkmark-circle" size={28} color="#6366F1" />
            </View>
          </View>

          {/* User Info */}
          <ThemedText
            style={[
              styles.userName,
              {
                color: colors.text,
              },
            ]}
          >
            Joseph Adebayo
          </ThemedText>
          <ThemedText
            style={[
              styles.userEmail,
              {
                color: theme.secondaryFontColor,
              },
            ]}
          >
            joseph.adebayo@example.com
          </ThemedText>
        </View>

        {/* Switch to Landlord Card */}
        <TouchableOpacity
          style={[
            styles.landlordCard,
            {
              backgroundColor: isLight ? '#4F46E5' : '#6366F1',
            },
          ]}
        >
          <View style={styles.landlordCardContent}>
            <MaterialCommunityIcons
              name="home-account"
              size={32}
              color="#fff"
            />
            <View style={styles.landlordCardText}>
              <ThemedText
                style={[
                  styles.landlordTitle,
                  { color: '#fff' },
                ]}
              >
                Switch to Landlord
              </ThemedText>
              <ThemedText
                style={[
                  styles.landlordSubtitle,
                  { color: 'rgba(255, 255, 255, 0.8)' },
                ]}
              >
                List your property today
              </ThemedText>
            </View>
          </View>
          <Switch
            value={landlordToggle}
            onValueChange={setLandlordToggle}
            thumbColor={landlordToggle ? '#6366F1' : '#fff'}
            trackColor={{
              false: 'rgba(255, 255, 255, 0.3)',
              true: 'rgba(99, 102, 241, 0.3)',
            }}
          />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText
            style={[
              styles.sectionHeader,
              { color: theme.secondaryFontColor },
            ]}
          >
            ACCOUNT
          </ThemedText>
          <View style={styles.menuContainer}>
            {accountMenuItems.map((item, index) =>
              renderMenuItem(item, index === accountMenuItems.length - 1)
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText
            style={[
              styles.sectionHeader,
              { color: theme.secondaryFontColor },
            ]}
          >
            PREFERENCES
          </ThemedText>
          <View style={styles.menuContainer}>
            {preferencesMenuItems.map((item, index) =>
              renderMenuItem(item, index === preferencesMenuItems.length - 1)
            )}
          </View>
        </View>

        {/* Support & Info Section */}
        <View style={[styles.section, styles.lastSection]}>
          <ThemedText
            style={[
              styles.sectionHeader,
              { color: theme.secondaryFontColor },
            ]}
          >
            SUPPORT & INFO
          </ThemedText>
          <View style={styles.menuContainer}>
            {supportMenuItems.map((item, index) =>
              renderMenuItem(item, index === supportMenuItems.length - 1)
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  // Profile Header Styles
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Landlord Card Styles
  landlordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 32,
  },
  landlordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  landlordCardText: {
    marginLeft: 16,
    flex: 1,
  },
  landlordTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  landlordSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Section Styles
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4
  },

  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
})