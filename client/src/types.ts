export type Category = 'Food' | 'Shopping' | 'Entertainment' | 'Service' | 'Event';

export interface Store {
  id: string;
  name: string;
  category: Category;
  discountRate: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  image: string;
  isSponsored?: boolean;
  loyaltyScore?: number;
  openingDate?: string; // For "Coming Soon"
  description: string;
  rating: number;
  distance?: string; // Calculated or mock
}

export interface User {
  id: string;
  name: string;
  level: string; // e.g., "İzmit Gezgini"
  savings: number;
  reviews: number;
  badges: string[]; // Icon names
}
