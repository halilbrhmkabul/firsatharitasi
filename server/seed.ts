import { db } from "./db";
import { stores } from "@shared/schema";

const SEED_STORES = [
  {
    name: 'Symbol AVM',
    category: 'Shopping',
    discountRate: 20,
    latitude: '40.7554',
    longitude: '29.9708',
    address: 'Ovacık, D100 Karayolu No:34, 41140 Başiskele/Kocaeli',
    image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3c9f?auto=format&fit=crop&q=80&w=800',
    isSponsored: true,
    description: "Kocaeli'nin en büyük alışveriş ve yaşam merkezi.",
    rating: '4.7',
  },
  {
    name: 'Kahve Dünyası',
    category: 'Food',
    discountRate: 15,
    latitude: '40.7660',
    longitude: '29.9380',
    address: 'Karabaş, Cumhuriyet Cd. No:12, 41040 İzmit/Kocaeli',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
    description: 'Taze kahve ve çikolata keyfi.',
    rating: '4.5',
  },
  {
    name: '41 Burda AVM',
    category: 'Shopping',
    discountRate: 10,
    latitude: '40.7600',
    longitude: '29.9550',
    address: 'Sanayi, Ömer Türkçakal Blv. No:7, 41040 İzmit/Kocaeli',
    image: 'https://images.unsplash.com/photo-1567449303078-57a614d6e92c?auto=format&fit=crop&q=80&w=800',
    description: 'Moda, eğlence ve lezzet bir arada.',
    rating: '4.6',
  },
  {
    name: 'Burger King',
    category: 'Food',
    discountRate: 25,
    latitude: '40.7630',
    longitude: '29.9410',
    address: 'Yürüyüş Yolu, İzmit',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800',
    description: 'Ateş seni çağırıyor.',
    rating: '4.2',
  },
  {
    name: 'Cinemaximum',
    category: 'Entertainment',
    discountRate: 50,
    latitude: '40.7560',
    longitude: '29.9715',
    address: 'Symbol AVM, 2. Kat',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
    description: 'Sinema keyfi şimdi %50 indirimli.',
    rating: '4.8',
    loyaltyScore: 150,
  },
  {
    name: 'Mavi',
    category: 'Shopping',
    discountRate: 30,
    latitude: '40.7650',
    longitude: '29.9400',
    address: 'Fethiye Cad. İzmit',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
    description: 'Jean tutkunları için özel indirimler.',
    rating: '4.4',
    loyaltyScore: 80,
  },
  {
    name: 'Tiyatro Festivali',
    category: 'Event',
    discountRate: 100,
    latitude: '40.7680',
    longitude: '29.9450',
    address: 'Süleyman Demirel Kültür Merkezi',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800',
    description: 'Ücretsiz tiyatro gösterimi.',
    rating: '4.9',
    openingDate: '2024-06-01',
    loyaltyScore: 200,
  },
  {
    name: 'Happy Moon\'s',
    category: 'Food',
    discountRate: 15,
    latitude: '40.7550',
    longitude: '29.9720',
    address: 'Symbol AVM Teras',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800',
    description: 'Büyük porsiyonlar, büyük mutluluklar.',
    rating: '4.6',
    loyaltyScore: 120,
  },
  {
    name: 'Teknosa',
    category: 'Shopping',
    discountRate: 5,
    latitude: '40.7610',
    longitude: '29.9560',
    address: '41 Burda AVM Zemin Kat',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
    description: 'Teknoloji alışverişinde fırsat.',
    rating: '4.3',
  },
  {
    name: 'Sekapark Etkinlik Alanı',
    category: 'Event',
    discountRate: 0,
    latitude: '40.7580',
    longitude: '29.9200',
    address: 'Sekapark, İzmit',
    image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=800',
    description: 'Yaz konseri serisi başlıyor!',
    rating: '4.8',
    openingDate: '2024-07-15',
  },
  {
    name: 'Gebze Center',
    category: 'Shopping',
    discountRate: 20,
    latitude: '40.8028',
    longitude: '29.4307',
    address: 'Güney Yanyol, Gebze',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
    description: "Gebze'nin kalbi burada atıyor.",
    rating: '4.5',
  },
  {
    name: 'Eskihisar Kalesi',
    category: 'Event',
    discountRate: 50,
    latitude: '40.7720',
    longitude: '29.4280',
    address: 'Eskihisar, Gebze',
    image: 'https://images.unsplash.com/photo-1599590984117-a6d8fe1a9e49?auto=format&fit=crop&q=80&w=800',
    description: 'Tarihi atmosferde açık hava sineması.',
    rating: '4.9',
  },
  {
    name: 'Faruk Güllüoğlu',
    category: 'Food',
    discountRate: 10,
    latitude: '40.8000',
    longitude: '29.4350',
    address: 'Gebze Meydan',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
    description: 'Geleneksel tatlıların adresi.',
    rating: '4.4',
  },
  {
    name: 'MacFit',
    category: 'Service',
    discountRate: 40,
    latitude: '40.7620',
    longitude: '29.9580',
    address: '41 Burda AVM',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    description: 'Spora başlamanın tam zamanı.',
    rating: '4.7',
  },
  {
    name: 'Coming Soon Mall',
    category: 'Shopping',
    discountRate: 0,
    latitude: '40.7700',
    longitude: '29.9500',
    address: 'Yahya Kaptan',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
    description: 'Çok yakında hizmetinizde.',
    rating: '0',
    openingDate: '2025-01-01',
  }
];

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Clear existing stores
    await db.delete(stores);
    console.log('Cleared existing stores');

    // Insert seed data
    await db.insert(stores).values(SEED_STORES);
    console.log(`Inserted ${SEED_STORES.length} stores`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
