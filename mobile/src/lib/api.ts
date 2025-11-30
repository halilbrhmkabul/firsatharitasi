import { Store } from '../types';

// For development, replace with your computer's IP address
// For production, use your actual API URL
const API_BASE = __DEV__
  ? 'http://192.168.1.100:5000/api'  // Change this to your computer's IP
  : 'https://your-production-api.com/api';

function transformStoreData(store: any): Store {
  return {
    id: store.id.toString(),
    name: store.name,
    category: store.category,
    discountRate: store.discountRate,
    coordinates: {
      lat: parseFloat(store.latitude),
      lng: parseFloat(store.longitude),
    },
    address: store.address,
    image: store.image,
    description: store.description,
    rating: parseFloat(store.rating),
    isSponsored: store.isSponsored,
    loyaltyScore: store.loyaltyScore,
    openingDate: store.openingDate,
  };
}

export async function fetchStores(filters?: {
  categories?: string[];
  minDiscount?: number;
}): Promise<Store[]> {
  const params = new URLSearchParams();

  if (filters?.categories && filters.categories.length > 0) {
    filters.categories.forEach(cat => params.append('categories', cat));
  }

  if (filters?.minDiscount !== undefined && filters.minDiscount > 0) {
    params.append('minDiscount', filters.minDiscount.toString());
  }

  const url = `${API_BASE}/stores${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }

  const data = await response.json();

  return data.map(transformStoreData);
}

export async function fetchStoreById(id: number): Promise<Store> {
  const response = await fetch(`${API_BASE}/stores/${id}`);

  if (!response.ok) {
    throw new Error('Store not found');
  }

  const store = await response.json();

  return transformStoreData(store);
}
