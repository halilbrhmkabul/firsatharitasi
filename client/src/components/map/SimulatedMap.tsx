import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from '../../types';
import { MOCK_USER } from '../../data/mockData';
import { ShoppingBag, Utensils, Music, Star, Construction, MapPin } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface SimulatedMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onStoreSelect: (store: Store) => void;
  isDarkMode: boolean;
}

function MapController({ selectedStore }: { selectedStore: Store | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStore) {
      map.flyTo([selectedStore.coordinates.lat, selectedStore.coordinates.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedStore, map]);

  return null;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food': return <Utensils className="w-5 h-5 text-white" />;
    case 'Shopping': return <ShoppingBag className="w-5 h-5 text-white" />;
    case 'Entertainment': return <Music className="w-5 h-5 text-white" />;
    case 'Event': return <Star className="w-5 h-5 text-white" />;
    default: return <MapPin className="w-5 h-5 text-white" />;
  }
};

const createCustomIcon = (store: Store) => {
  const isComingSoon = !!store.openingDate;
  const iconHtml = renderToString(
    <div className={`relative flex items-center justify-center w-10 h-12 transform -translate-x-1/2 -translate-y-full ${isComingSoon ? 'opacity-90' : ''}`}>
       {/* Teardrop Shape */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10 ${isComingSoon ? 'bg-yellow-500' : 'bg-primary'}`} style={{ borderBottomRightRadius: '0' }}>
         <div className="transform rotate-45 -mt-1 -ml-1">
            <div className="-rotate-45">
               {isComingSoon ? <Construction className="w-5 h-5 text-white" /> : getCategoryIcon(store.category)}
            </div>
         </div>
      </div>
      {/* Glow for Sponsored */}
      {store.isSponsored && (
        <div className="absolute inset-0 bg-primary blur-md opacity-50 rounded-full animate-pulse"></div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [40, 48],
    iconAnchor: [20, 48], // Tip of the teardrop
  });
};

const createUserIcon = () => {
    const html = renderToString(
        <div className="relative flex items-center justify-center w-16 h-16">
            {/* Outer Pulse */}
            <div className="absolute w-full h-full rounded-full bg-blue-500/30 animate-radar"></div>
            {/* Inner Glow */}
            <div className="absolute w-10 h-10 rounded-full bg-blue-500/50 blur-sm"></div>
            {/* Core */}
            <div className="relative w-8 h-8 bg-white rounded-full p-1 shadow-xl z-20 ring-4 ring-blue-500/20">
                <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
             {/* Direction Cone (Decorative) */}
            <div className="absolute -top-8 z-10 opacity-0">
                 {/* Placeholder for direction if needed */}
            </div>
        </div>
    );
    
    return L.divIcon({
        html: html,
        className: 'user-marker-icon',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
    });
};

export default function SimulatedMap({ stores, selectedStore, onStoreSelect, isDarkMode }: SimulatedMapProps) {
  // Izmit Coordinates
  const center: [number, number] = [40.7654, 29.9408];
  
  const tileLayerUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={tileLayerUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController selectedStore={selectedStore} />

        {/* User Location */}
        <Marker 
            position={center} 
            icon={createUserIcon()}
            interactive={false}
        />

        {/* Stores */}
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.coordinates.lat, store.coordinates.lng]}
            icon={createCustomIcon(store)}
            eventHandlers={{
              click: () => {
                onStoreSelect(store);
              },
            }}
          >
            {store.openingDate && (
                <Popup className="custom-popup" closeButton={false}>
                     <div className="text-xs font-bold text-center px-2 py-1">COMING SOON</div>
                </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
