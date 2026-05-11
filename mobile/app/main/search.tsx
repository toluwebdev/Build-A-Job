import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  withSequence,
} from 'react-native-reanimated';
import {
  Search,
  Map as MapIcon,
  List,
  SlidersHorizontal,
  Star,
  Shield,
  Award,
  MapPin,
  Phone,
  X,
  ChevronDown,
  Navigation,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius, Shadows } from '../../src/constants';

const { width, height } = Dimensions.get('window');

// Types
interface Trader {
  id: string;
  name: string;
  companyName: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  premium: boolean;
  specialties: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance: number;
  phone?: string;
  isOpen: boolean;
}

// Mock traders data
const mockTraders: Trader[] = [
  {
    id: 't1',
    name: 'John Smith',
    companyName: 'Premier Paving Ltd',
    rating: 4.9,
    reviewCount: 127,
    verified: true,
    premium: true,
    specialties: ['Driveways', 'Patios', 'Landscaping'],
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      address: '123 Builder St, London',
    },
    distance: 0.8,
    phone: '+44 20 7123 4567',
    isOpen: true,
  },
  {
    id: 't2',
    name: 'Sarah Johnson',
    companyName: 'SJ Groundworks',
    rating: 4.7,
    reviewCount: 89,
    verified: true,
    premium: false,
    specialties: ['Driveways', 'Foundations', 'Drainage'],
    location: {
      latitude: 51.512,
      longitude: -0.13,
      address: '45 Construction Rd, London',
    },
    distance: 1.2,
    phone: '+44 20 7234 5678',
    isOpen: true,
  },
  {
    id: 't3',
    name: 'Mike Williams',
    companyName: 'MW Construction',
    rating: 4.5,
    reviewCount: 56,
    verified: false,
    premium: false,
    specialties: ['Driveways', 'Patios'],
    location: {
      latitude: 51.505,
      longitude: -0.12,
      address: '78 Trade Ave, London',
    },
    distance: 1.5,
    phone: '+44 20 7345 6789',
    isOpen: false,
  },
  {
    id: 't4',
    name: 'Emma Davis',
    companyName: 'Elite Landscapes',
    rating: 4.8,
    reviewCount: 203,
    verified: true,
    premium: true,
    specialties: ['Garden Design', 'Patios', 'Fencing'],
    location: {
      latitude: 51.51,
      longitude: -0.125,
      address: '90 Garden Ln, London',
    },
    distance: 0.5,
    phone: '+44 20 7456 7890',
    isOpen: true,
  },
  {
    id: 't5',
    name: 'David Brown',
    companyName: 'DB Roofing Specialists',
    rating: 4.6,
    reviewCount: 78,
    verified: true,
    premium: false,
    specialties: ['Roofing', 'Guttering', 'Repairs'],
    location: {
      latitude: 51.503,
      longitude: -0.135,
      address: '12 Roof St, London',
    },
    distance: 2.1,
    phone: '+44 20 7567 8901',
    isOpen: true,
  },
];

// Filter options
const filterOptions = [
  { id: 'all', label: 'All Trades' },
  { id: 'driveway', label: 'Driveways' },
  { id: 'garden', label: 'Garden' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'roofing', label: 'Roofing' },
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
];

// Sort options
const sortOptions = [
  { id: 'distance', label: 'Nearest' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'reviews', label: 'Most Reviews' },
];

// Star rating component
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={star <= Math.round(rating) ? '#F59E0B' : Colors.textMuted}
          fill={star <= Math.round(rating) ? '#F59E0B' : 'transparent'}
        />
      ))}
    </View>
  );
}

// Filter chip component
function FilterChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.filterChip,
          isSelected && styles.filterChipSelected,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextSelected,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Trader card component
function TraderCard({
  trader,
  onPress,
}: {
  trader: Trader;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View style={[styles.traderCard, animatedStyle]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#7B5CF6', '#00D4AA']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {trader.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </LinearGradient>
            {trader.verified && (
              <View style={styles.verifiedBadge}>
                <Shield size={10} color={Colors.background} fill="#00D4AA" />
              </View>
            )}
          </View>

          <View style={styles.traderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.traderName}>{trader.name}</Text>
              {trader.premium && (
                <View style={styles.premiumBadge}>
                  <Award size={12} color={Colors.background} />
                  <Text style={styles.premiumText}>Pro</Text>
                </View>
              )}
            </View>
            <Text style={styles.companyName}>{trader.companyName}</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={trader.rating} />
              <Text style={styles.ratingText}>
                {trader.rating} ({trader.reviewCount})
              </Text>
            </View>
          </View>

          <View style={styles.distanceContainer}>
            <Navigation size={14} color={Colors.primary} />
            <Text style={styles.distanceText}>{trader.distance} mi</Text>
          </View>
        </View>

        {/* Specialties */}
        <View style={styles.specialtiesContainer}>
          {trader.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <MapPin size={14} color={Colors.textMuted} />
            <Text style={styles.footerText} numberOfLines={1}>
              {trader.location.address}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: trader.isOpen ? '#10B981' : '#EF4444' },
              ]}
            />
            <Text style={styles.footerText}>
              {trader.isOpen ? 'Open now' : 'Closed'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Map marker component
function MapMarker({
  trader,
  isSelected,
  onPress,
}: {
  trader: Trader;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Marker
      coordinate={{
        latitude: trader.location.latitude,
        longitude: trader.location.longitude,
      }}
      onPress={onPress}
    >
      <View style={[styles.mapMarker, isSelected && styles.mapMarkerSelected]}>
        <LinearGradient
          colors={
            isSelected ? [Colors.primary, '#00D4AA'] : ['#7B5CF6', '#5B3DD6']
          }
          style={styles.markerGradient}
        >
          <Text style={styles.markerText}>
            {trader.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </LinearGradient>
        {trader.verified && (
          <View style={styles.markerVerified}>
            <Shield size={8} color={Colors.background} fill="#00D4AA" />
          </View>
        )}
      </View>
    </Marker>
  );
}

export default function SearchScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Filter and sort traders
  const filteredTraders = mockTraders
    .filter((trader) => {
      if (selectedFilter === 'all') return true;
      return trader.specialties.some((s) =>
        s.toLowerCase().includes(selectedFilter)
      );
    })
    .filter((trader) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        trader.name.toLowerCase().includes(query) ||
        trader.companyName.toLowerCase().includes(query) ||
        trader.specialties.some((s) => s.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'distance':
        default:
          return a.distance - b.distance;
      }
    });

  const handleTraderPress = (traderId: string) => {
    router.push(`/main/trader-profile/${traderId}`);
  };

  const handleMarkerPress = (traderId: string) => {
    setSelectedTrader(traderId);
    const trader = mockTraders.find((t) => t.id === traderId);
    if (trader && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: trader.location.latitude,
        longitude: trader.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const toggleViewMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(viewMode === 'list' ? 'map' : 'list');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tradespeople..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.viewToggle} onPress={toggleViewMode}>
          {viewMode === 'list' ? (
            <MapIcon size={22} color={Colors.text} />
          ) : (
            <List size={22} color={Colors.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              isSelected={selectedFilter === item.id}
              onPress={() => setSelectedFilter(item.id)}
            />
          )}
        />
      </View>

      {/* Sort and Results Count */}
      <View style={styles.sortContainer}>
        <Text style={styles.resultsCount}>
          {filteredTraders.length} tradespeople found
        </Text>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortDropdown(!showSortDropdown)}
        >
          <SlidersHorizontal size={16} color={Colors.text} />
          <Text style={styles.sortText}>
            {sortOptions.find((s) => s.id === selectedSort)?.label}
          </Text>
          <ChevronDown
            size={14}
            color={Colors.text}
            style={[
              styles.sortIcon,
              showSortDropdown && styles.sortIconOpen,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Sort Dropdown */}
      {showSortDropdown && (
        <View style={styles.sortDropdown}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                selectedSort === option.id && styles.sortOptionSelected,
              ]}
              onPress={() => {
                setSelectedSort(option.id);
                setShowSortDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  selectedSort === option.id &&
                    styles.sortOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredTraders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TraderCard
              trader={item}
              onPress={() => handleTraderPress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: 51.5074,
              longitude: -0.1278,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {filteredTraders.map((trader) => (
              <MapMarker
                key={trader.id}
                trader={trader}
                isSelected={selectedTrader === trader.id}
                onPress={() => handleMarkerPress(trader.id)}
              />
            ))}
          </MapView>

          {/* Selected Trader Card on Map */}
          {selectedTrader && (
            <View style={styles.mapCardContainer}>
              {(() => {
                const trader = mockTraders.find((t) => t.id === selectedTrader);
                return trader ? (
                  <TraderCard
                    trader={trader}
                    onPress={() => handleTraderPress(trader.id)}
                  />
                ) : null;
              })()}
            </View>
          )}
        </View>
      )}
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
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.text,
    paddingVertical: Spacing.xs,
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Filters
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  filterChipTextSelected: {
    color: Colors.background,
  },

  // Sort
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  sortIcon: {
    transform: [{ rotate: '0deg' }],
  },
  sortIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  sortDropdown: {
    position: 'absolute',
    top: 140,
    right: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.large,
    zIndex: 100,
    minWidth: 150,
  },
  sortOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sortOptionSelected: {
    backgroundColor: `${Colors.primary}20`,
  },
  sortOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  sortOptionTextSelected: {
    color: Colors.primary,
  },

  // List
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },

  // Trader Card
  traderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  traderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  traderName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  premiumText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  specialtyTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  specialtyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Map
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    alignItems: 'center',
  },
  mapMarkerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
    ...Shadows.medium,
  },
  markerText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.background,
  },
  markerVerified: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00D4AA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  mapCardContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
});
