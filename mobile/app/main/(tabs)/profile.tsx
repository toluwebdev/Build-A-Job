import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Edit3,
  MapPin,
  CreditCard,
  Star,
  Briefcase,
  MessageSquare,
  Moon,
  Mail,
  Phone,
  Lock,
  Trash2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius } from '../../../src/constants';
import { useApp } from '../../../src/context/AppContext';
import { alerts } from '../../../src/services/alertService';

// Types
interface MenuItem {
  id: string;
  icon: typeof User;
  label: string;
  value?: string;
  hasArrow?: boolean;
  isDestructive?: boolean;
  onPress?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Stat card component
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Briefcase;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Menu item component
function MenuItem({
  item,
}: {
  item: MenuItem;
}) {
  const scale = useSharedValue(1);
  const Icon = item.icon;

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    item.onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.menuItem,
          animatedStyle,
          item.isDestructive && styles.menuItemDestructive,
        ]}
      >
        <View
          style={[
            styles.menuIcon,
            item.isDestructive && styles.menuIconDestructive,
          ]}
        >
          <Icon
            size={20}
            color={item.isDestructive ? '#EF4444' : Colors.primary}
          />
        </View>
        <View style={styles.menuContent}>
          <Text
            style={[
              styles.menuLabel,
              item.isDestructive && styles.menuLabelDestructive,
            ]}
          >
            {item.label}
          </Text>
          {item.value && (
            <Text style={styles.menuValue} numberOfLines={1}>
              {item.value}
            </Text>
          )}
        </View>
        {item.hasArrow && (
          <ChevronRight
            size={20}
            color={item.isDestructive ? '#EF4444' : Colors.textMuted}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Toggle item component
function ToggleItem({
  icon: Icon,
  label,
  value,
  onToggle,
}: {
  icon: typeof User;
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleItem}>
      <View style={styles.menuIcon}>
        <Icon size={20} color={Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.surface, true: `${Colors.primary}50` }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logoutAccount } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  const displayName = useMemo(() => {
    if (!user) return 'Guest';
    const name = `${user.firstName} ${user.lastName}`.trim();
    return name || user.email.split('@')[0] || 'Account';
  }, [user]);

  const initials = useMemo(() => {
    if (!user) return 'GU';
    const a = user.firstName?.[0] ?? '';
    const b = user.lastName?.[0] ?? '';
    const pair = `${a}${b}`.toUpperCase();
    return pair || user.email?.[0]?.toUpperCase() || '?';
  }, [user]);

  const handleLogout = async () => {
    const ok = await alerts.confirm('Are you sure you want to sign out?', {
      title: 'Sign Out',
      confirmText: 'Sign Out',
      destructive: true,
    });
    if (!ok) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logoutAccount();
    router.replace('/auth/login');
  };

  const handleDeleteAccount = async () => {
    const ok = await alerts.confirm(
      'This action cannot be undone. All your data will be permanently deleted.',
      {
        title: 'Delete Account',
        confirmText: 'Delete',
        destructive: true,
      }
    );
    if (!ok) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    // Handle account deletion
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'personal-info',
          icon: User,
          label: 'Personal Information',
          value: displayName,
          hasArrow: true,
          onPress: () => {},
        },
        {
          id: 'address',
          icon: MapPin,
          label: 'My Addresses',
          value: '3 saved addresses',
          hasArrow: true,
          onPress: () => {},
        },
        {
          id: 'payment',
          icon: CreditCard,
          label: 'Payment Methods',
          value: '2 cards',
          hasArrow: true,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          icon: Bell,
          label: 'Notifications',
          hasArrow: true,
          onPress: () => {},
        },
        {
          id: 'privacy',
          icon: Shield,
          label: 'Privacy & Security',
          hasArrow: true,
          onPress: () => {},
        },
        {
          id: 'help',
          icon: HelpCircle,
          label: 'Help & Support',
          hasArrow: true,
          onPress: () => {},
        },
        {
          id: 'terms',
          icon: FileText,
          label: 'Terms & Conditions',
          hasArrow: true,
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {}}
        >
          <Settings size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#7B5CF6', '#00D4AA']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Edit3 size={14} color={Colors.background} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>
                {user?.email ?? 'Sign in to sync your profile'}
              </Text>
              <View style={styles.verifiedBadge}>
                <Shield size={12} color="#00D4AA" fill="#00D4AA" />
                <Text style={styles.verifiedText}>
                  {user?.emailVerified ? 'Verified Customer' : 'Verify your email'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatCard label="Jobs Posted" value="12" icon={Briefcase} />
            <StatCard label="Reviews" value="8" icon={Star} />
            <StatCard label="Messages" value="24" icon={MessageSquare} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIcon, { backgroundColor: `${Colors.primary}20` }]}>
              <Briefcase size={20} color={Colors.primary} />
            </View>
            <Text style={styles.quickLabel}>My Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIcon, { backgroundColor: '#F59E0B20' }]}>
              <Star size={20} color="#F59E0B" />
            </View>
            <Text style={styles.quickLabel}>Reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIcon, { backgroundColor: '#3B82F620' }]}>
              <CreditCard size={20} color="#3B82F6" />
            </View>
            <Text style={styles.quickLabel}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickIcon, { backgroundColor: '#10B98120' }]}>
              <MapPin size={20} color="#10B981" />
            </View>
            <Text style={styles.quickLabel}>Addresses</Text>
          </TouchableOpacity>
        </View>

        {/* Toggles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.togglesContainer}>
            <ToggleItem
              icon={Bell}
              label="Push Notifications"
              value={notifications}
              onToggle={setNotifications}
            />
            <ToggleItem
              icon={Mail}
              label="Email Updates"
              value={emailUpdates}
              onToggle={setEmailUpdates}
            />
            <ToggleItem
              icon={Moon}
              label="Dark Mode"
              value={darkMode}
              onToggle={setDarkMode}
            />
            <ToggleItem
              icon={MapPin}
              label="Location Services"
              value={locationServices}
              onToggle={setLocationServices}
            />
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>
          </View>
        ))}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              item={{
                id: 'logout',
                icon: LogOut,
                label: 'Sign Out',
                hasArrow: false,
                onPress: handleLogout,
              }}
            />
            <MenuItem
              item={{
                id: 'delete',
                icon: Trash2,
                label: 'Delete Account',
                hasArrow: false,
                isDestructive: true,
                onPress: handleDeleteAccount,
              }}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Build-A-Job v1.0.0</Text>
          <Text style={styles.appCopyright}>
            © 2024 Build-A-Job. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl * 2,
  },

  // Profile Card
  profileCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#00D4AA20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#00D4AA',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },

  // Section
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Toggles
  togglesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  // Menu
  menuContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemDestructive: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIconDestructive: {
    backgroundColor: '#EF444420',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  menuLabelDestructive: {
    color: '#EF4444',
  },
  menuValue: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  appCopyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textMuted,
  },
});
