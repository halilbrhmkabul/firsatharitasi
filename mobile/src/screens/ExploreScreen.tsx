import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store, Category } from '../types';
import { fetchStores } from '../lib/api';

const categories: { name: Category; icon: string; color: string }[] = [
  { name: 'Food', icon: 'restaurant', color: '#EF4444' },
  { name: 'Shopping', icon: 'cart', color: '#3B82F6' },
  { name: 'Entertainment', icon: 'game-controller', color: '#8B5CF6' },
  { name: 'Service', icon: 'construct', color: '#10B981' },
  { name: 'Event', icon: 'calendar', color: '#F59E0B' },
];

export default function ExploreScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await fetchStores();
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const filteredStores = stores.filter((store) => {
    if (selectedCategory && store.category !== selectedCategory) return false;
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity style={styles.storeItem} activeOpacity={0.7}>
      <Image source={{ uri: item.image }} style={styles.storeImage} />
      {item.discountRate > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>%{item.discountRate}</Text>
        </View>
      )}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.storeRating}>
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.storeAddress} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Keşfet</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryText,
              !selectedCategory && styles.categoryTextActive,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Ionicons
              name={category.icon as any}
              size={16}
              color={
                selectedCategory === category.name ? 'white' : category.color
              }
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name &&
                  styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stores Grid */}
      <FlatList
        data={filteredStores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.storesList}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTextActive: {
    color: 'white',
  },
  storesList: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  storeItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeImage: {
    width: '100%',
    height: 120,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  storeAddress: {
    fontSize: 11,
    color: '#6B7280',
  },
});
