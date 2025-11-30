# Fırsat Haritası - Mobile App

React Native mobil uygulaması (iOS & Android)

## 📱 Özellikler

- 🗺️ **Harita Görünümü**: Google Maps entegrasyonu ile yakındaki fırsatları görüntüle
- 🔍 **Keşfet**: Kategorilere göre mağazaları grid view'da keşfet
- 👤 **Profil**: Kullanıcı profili, tasarruf istatistikleri ve rozetler
- 📍 **Konum**: GPS ile otomatik konum tespiti
- 🎯 **Filtreler**: Kategori ve indirim oranına göre filtreleme

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo Go (mobil cihazda test için)
- Android Studio veya Xcode (emulator için)

### Adımlar

1. Bağımlılıkları yükle:
```bash
cd mobile
npm install
```

2. API URL'i ayarla:
`src/lib/api.ts` dosyasındaki `API_BASE` değişkenini bilgisayarınızın IP adresiyle güncelleyin:
```typescript
const API_BASE = 'http://192.168.1.100:5000/api';  // Kendi IP adresinizi yazın
```

3. Google Maps API Key ekle:
`app.json` dosyasında Google Maps API key'lerinizi ekleyin:
- iOS: `expo.ios.config.googleMapsApiKey`
- Android: `expo.android.config.googleMaps.apiKey`

4. Uygulamayı başlat:
```bash
npm start
```

## 🧪 Test

### Expo Go ile (Önerilen)

1. Mobil cihazınıza Expo Go uygulamasını yükleyin
2. `npm start` komutunu çalıştırın
3. QR kodu tarayın

### Emulator ile

**Android:**
```bash
npm run android
```

**iOS (sadece macOS):**
```bash
npm run ios
```

## 📂 Proje Yapısı

```
mobile/
├── src/
│   ├── components/       # UI bileşenleri
│   ├── screens/         # Ana ekranlar
│   ├── navigation/      # React Navigation yapısı
│   ├── lib/            # Utilities (API, query client)
│   ├── types/          # TypeScript tipleri
│   └── hooks/          # Custom hooks
├── assets/             # Görseller ve iconlar
├── App.tsx             # Ana uygulama
└── app.json           # Expo konfigürasyonu
```

## 🔧 Yapılandırma

### Backend Bağlantısı

Backend sunucunuzun çalıştığından emin olun:
```bash
# Ana klasörde
npm run dev
```

Backend varsayılan olarak `http://localhost:5000` adresinde çalışır.

### IP Adresinizi Bulma

**macOS/Linux:**
```bash
ifconfig | grep "inet "
```

**Windows:**
```bash
ipconfig
```

## 🎨 Ekranlar

1. **MapScreen** - Ana harita ekranı, mağaza markerları ve card carousel
2. **ExploreScreen** - Kategorili grid view, filtreleme
3. **ProfileScreen** - Kullanıcı profili ve ayarlar
4. **AuthScreen** - Giriş/Kayıt ekranı

## 📦 Kullanılan Teknolojiler

- **React Native** - Framework
- **Expo** - Development platform
- **React Navigation** - Navigasyon
- **React Native Maps** - Harita
- **Expo Location** - GPS konum
- **React Query** - API state management
- **TypeScript** - Type safety

## 🐛 Sorun Giderme

### Harita görünmüyor
- Google Maps API key'inizin geçerli olduğundan emin olun
- Android için billing aktif olmalı

### API bağlantısı çalışmıyor
- Backend sunucunuzun çalıştığından emin olun
- IP adresini doğru girdiğinizden emin olun
- Mobil cihazınız ve bilgisayarınız aynı WiFi ağında olmalı

### Konum izni sorunu
- Cihazınızda konum iznini verin
- iOS için: Settings > Privacy > Location Services
- Android için: Settings > Apps > Fırsat Haritası > Permissions

## 📱 Build

### Development Build
```bash
npx expo prebuild
```

### Production Build
```bash
# Android APK
eas build -p android

# iOS
eas build -p ios
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License
