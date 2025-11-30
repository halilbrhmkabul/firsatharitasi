import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Store } from '../types';
import { fetchStores } from '../lib/api';
import StoreCard from '../components/StoreCard';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [region, setRegion] = useState({
    latitude: 40.7654,
    longitude: 29.9401,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [location, setLocation] = useState({ district: 'İzmit', city: 'Kocaeli' });

  useEffect(() => {
    loadStores();
    getCurrentLocation();
  }, []);

  const loadStores = async () => {
    try {
      const data = await fetchStores();
      setStores(data);
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Reverse geocoding
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        setLocation({
          district: address.district || address.city || 'İzmit',
          city: address.region || address.country || 'Kocaeli',
        });
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.coordinates.lat,
              longitude: store.coordinates.lng,
            }}
            onPress={() => setSelectedStore(store)}
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>%{store.discountRate}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Location Bar */}
      <View style={styles.locationBar}>
        <View style={styles.locationIcon}>
          <Ionicons name="location" size={16} color="#666" />
        </View>
        <Text style={styles.locationText}>
          {location.district}, {location.city}
        </Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.aiButton}>
          <Ionicons name="sparkles" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.layersButton}>
          <Ionicons name="layers" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="navigate" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Store Cards Carousel */}
      {stores.length > 0 && !selectedStore && (
        <ScrollView
          horizontal
          style={styles.carousel}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onPress={() => setSelectedStore(store)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  locationBar: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  locationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 12,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  layersButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  carousel: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
});
