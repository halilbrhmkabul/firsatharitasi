import { useEffect, useState, type ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from '../../types';
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
  findMeTrigger?: number;
  shouldFlyToStore?: boolean;
}

function MapController({ selectedStore, userLocation, flyToUserTrigger, shouldFlyToStore = true }: { selectedStore: Store | null, userLocation: [number, number] | null, flyToUserTrigger: number, shouldFlyToStore?: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStore && shouldFlyToStore) {
      map.flyTo([selectedStore.coordinates.lat, selectedStore.coordinates.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedStore, map, shouldFlyToStore]);

  useEffect(() => {
    if (flyToUserTrigger > 0 && userLocation) {
      map.flyTo(userLocation, 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [flyToUserTrigger, userLocation, map]);

  return null;
}

const categoryConfig: Record<string, { icon: ReactNode; color: string; label: string }> = {
  Food: { 
    icon: <Utensils className="w-4 h-4 text-white" />, 
    color: 'bg-orange-500',
    label: 'Yemek'
  },
  Shopping: { 
    icon: <ShoppingBag className="w-4 h-4 text-white" />, 
    color: 'bg-blue-500',
    label: 'Alışveriş'
  },
  Entertainment: { 
    icon: <Music className="w-4 h-4 text-white" />, 
    color: 'bg-purple-500',
    label: 'Eğlence'
  },
  Event: { 
    icon: <Star className="w-4 h-4 text-white" />, 
    color: 'bg-pink-500',
    label: 'Etkinlik'
  },
  Service: { 
    icon: <MapPin className="w-4 h-4 text-white" />, 
    color: 'bg-teal-500',
    label: 'Hizmet'
  },
};

const getCategoryIcon = (category: string) => {
  return categoryConfig[category]?.icon || <MapPin className="w-4 h-4 text-white" />;
};

const getCategoryColor = (category: string) => {
  return categoryConfig[category]?.color || 'bg-gray-500';
};

const createCustomIcon = (store: Store) => {
  const isComingSoon = !!store.openingDate;
  const categoryColor = isComingSoon ? 'bg-amber-500' : getCategoryColor(store.category);
  
  const iconHtml = renderToString(
    <div className="relative flex flex-col items-center">
      {/* Main marker circle */}
      <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-xl border-3 border-white ${categoryColor}`}
           style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
        {isComingSoon ? <Construction className="w-5 h-5 text-white" /> : getCategoryIcon(store.category)}
        {/* Discount badge */}
        {store.discountRate > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-md">
            %{store.discountRate}
          </div>
        )}
      </div>
      {/* Pointer triangle */}
      <div className={`w-0 h-0 -mt-1 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent ${categoryColor.replace('bg-', 'border-t-')}`}
           style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }}></div>
      {/* Glow for Sponsored */}
      {store.isSponsored && (
        <div className={`absolute -inset-1 ${categoryColor} blur-lg opacity-40 rounded-full animate-pulse`}></div>
      )}
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-icon',
    iconSize: [44, 54],
    iconAnchor: [22, 54],
  });
};

const createUserIcon = () => {
    const html = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 64px; height: 64px;">
            <div class="animate-radar" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(59, 130, 246, 0.3);"></div>
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(59, 130, 246, 0.5); filter: blur(4px);"></div>
            <div style="position: relative; width: 32px; height: 32px; background: white; border-radius: 50%; padding: 4px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 20; outline: 4px solid rgba(59, 130, 246, 0.2);">
                <div style="width: 100%; height: 100%; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                </div>
            </div>
        </div>
    `;
    
    return L.divIcon({
        html: html,
        className: 'user-marker-icon',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
    });
};

export default function SimulatedMap({ stores, selectedStore, onStoreSelect, isDarkMode, findMeTrigger, shouldFlyToStore = true }: SimulatedMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const defaultCenter: [number, number] = [40.7654, 29.9408];
  const [flyToUserTrigger, setFlyToUserTrigger] = useState(0);
  
  const tileLayerUrl = isDarkMode 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            },
            () => {
                console.log("Location access denied, using default.");
                setUserLocation(defaultCenter);
            }
        );
    } else {
        setUserLocation(defaultCenter);
    }
  }, []);

  useEffect(() => {
    if (findMeTrigger && findMeTrigger > 0) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            setFlyToUserTrigger(prev => prev + 1);
          },
          () => {
            if (userLocation) {
              setFlyToUserTrigger(prev => prev + 1);
            }
          }
        );
      } else if (userLocation) {
        setFlyToUserTrigger(prev => prev + 1);
      }
    }
  }, [findMeTrigger]);

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={tileLayerUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController selectedStore={selectedStore} userLocation={userLocation} flyToUserTrigger={flyToUserTrigger} shouldFlyToStore={shouldFlyToStore} />

        {/* User Location */}
        {userLocation && (
            <Marker 
                position={userLocation} 
                icon={createUserIcon()}
                interactive={false}
            />
        )}

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

export { SimulatedMap };
