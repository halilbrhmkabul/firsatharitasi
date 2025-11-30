import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '../lib/auth.tsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Plus, Store, Percent, MapPin, Image, FileText,
  Edit2, Trash2, Tag, Calendar, CheckCircle, X, Clock
} from 'lucide-react';

interface StoreData {
  id: number;
  name: string;
  category: string;
  discountRate: number;
  latitude: string;
  longitude: string;
  address: string;
  image: string;
  description: string;
  loyaltyScore: number;
  isVerified: boolean;
}

interface DiscountData {
  id: number;
  storeId: number;
  title: string;
  description: string;
  discountRate: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const CATEGORIES = [
  { value: 'Food', label: 'Yeme-İçme', icon: '🍽️' },
  { value: 'Shopping', label: 'Alışveriş', icon: '🛍️' },
  { value: 'Entertainment', label: 'Eğlence', icon: '🎮' },
  { value: 'Event', label: 'Etkinlik', icon: '🎪' },
  { value: 'Service', label: 'Hizmet', icon: '🔧' },
];

export default function BusinessDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [discounts, setDiscounts] = useState<DiscountData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stores' | 'discounts'>('stores');
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [storeForm, setStoreForm] = useState({
    name: '',
    category: 'Food',
    latitude: '',
    longitude: '',
    address: '',
    image: '',
    description: '',
  });

  const [discountForm, setDiscountForm] = useState({
    title: '',
    description: '',
    discountRate: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'business')) {
      setLocation('/auth');
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'business') {
      fetchStores();
    }
  }, [isAuthenticated, user]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/business/stores', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStores(data);
        if (data.length > 0) {
          setSelectedStoreId(data[0].id);
          fetchDiscounts(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiscounts = async (storeId: number) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/discounts`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingStore 
        ? `/api/business/stores/${editingStore.id}` 
        : '/api/business/stores';
      
      const response = await fetch(url, {
        method: editingStore ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(storeForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'İşlem başarısız');
      }

      setShowStoreForm(false);
      setEditingStore(null);
      setStoreForm({
        name: '',
        category: 'Food',
        latitude: '',
        longitude: '',
        address: '',
        image: '',
        description: '',
      });
      fetchStores();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedStoreId) {
      setError('Lütfen bir mağaza seçin');
      return;
    }

    try {
      const response = await fetch('/api/business/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...discountForm,
          storeId: selectedStoreId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'İşlem başarısız');
      }

      setShowDiscountForm(false);
      setDiscountForm({
        title: '',
        description: '',
        discountRate: 10,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchDiscounts(selectedStoreId);
      fetchStores();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteStore = async (storeId: number) => {
    if (!confirm('Bu mağazayı silmek istediğinizden emin misiniz?')) return;

    try {
      await fetch(`/api/business/stores/${storeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchStores();
    } catch (err) {
      console.error('Error deleting store:', err);
    }
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (!confirm('Bu indirimi silmek istediğinizden emin misiniz?')) return;

    try {
      await fetch(`/api/business/discounts/${discountId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (selectedStoreId) fetchDiscounts(selectedStoreId);
    } catch (err) {
      console.error('Error deleting discount:', err);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStoreForm(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Konum alınamadı');
        }
      );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setLocation('/')}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">İşletme Paneli</h1>
            <p className="text-sm text-white/80">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('stores')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'stores' ? 'bg-white text-purple-600' : 'bg-white/20'
            }`}
            data-testid="tab-stores"
          >
            <Store className="w-4 h-4 inline mr-1" />
            Mağazalarım
          </button>
          <button
            onClick={() => setActiveTab('discounts')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'discounts' ? 'bg-white text-purple-600' : 'bg-white/20'
            }`}
            data-testid="tab-discounts"
          >
            <Percent className="w-4 h-4 inline mr-1" />
            İndirimler
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'stores' ? (
          <>
            <Button
              onClick={() => setShowStoreForm(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="button-add-store"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Mağaza Ekle
            </Button>

            {stores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Henüz mağazanız yok</p>
                <p className="text-sm">İlk mağazanızı ekleyin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map(store => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                    data-testid={`store-card-${store.id}`}
                  >
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{store.name}</h3>
                          {store.isVerified && (
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {CATEGORIES.find(c => c.value === store.category)?.label}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            {store.discountRate}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Sadakat: {store.loyaltyScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            setEditingStore(store);
                            setStoreForm({
                              name: store.name,
                              category: store.category,
                              latitude: store.latitude,
                              longitude: store.longitude,
                              address: store.address,
                              image: store.image,
                              description: store.description,
                            });
                            setShowStoreForm(true);
                          }}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600"
                          data-testid={`button-edit-store-${store.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStore(store.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-500"
                          data-testid={`button-delete-store-${store.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {stores.length > 0 && (
              <>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {stores.map(store => (
                    <button
                      key={store.id}
                      onClick={() => {
                        setSelectedStoreId(store.id);
                        fetchDiscounts(store.id);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        selectedStoreId === store.id 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white text-gray-600'
                      }`}
                      data-testid={`button-select-store-${store.id}`}
                    >
                      {store.name}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setShowDiscountForm(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-add-discount"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni İndirim Ekle
                </Button>
              </>
            )}

            {discounts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Percent className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Henüz indirim yok</p>
                <p className="text-sm">İlk indiriminizi ekleyin</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discounts.map(discount => (
                  <motion.div
                    key={discount.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                    data-testid={`discount-card-${discount.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            %{discount.discountRate}
                          </span>
                          {discount.isActive && new Date(discount.endDate) > new Date() ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                              Sona erdi
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold">{discount.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{discount.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(discount.startDate).toLocaleDateString('tr-TR')} - {new Date(discount.endDate).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDiscount(discount.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-500"
                        data-testid={`button-delete-discount-${discount.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showStoreForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowStoreForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingStore ? 'Mağazayı Düzenle' : 'Yeni Mağaza'}
                </h2>
                <button
                  onClick={() => {
                    setShowStoreForm(false);
                    setEditingStore(null);
                  }}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleStoreSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mağaza Adı</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={storeForm.name}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      placeholder="Mağaza adını girin"
                      required
                      data-testid="input-store-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Kategori</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setStoreForm(prev => ({ ...prev, category: cat.value }))}
                        className={`p-3 rounded-xl text-center transition-all ${
                          storeForm.category === cat.value 
                            ? 'bg-purple-100 border-2 border-purple-500' 
                            : 'bg-gray-50 border-2 border-transparent'
                        }`}
                        data-testid={`button-category-${cat.value}`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <p className="text-xs mt-1">{cat.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Konum</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={storeForm.latitude}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="Enlem"
                      required
                      data-testid="input-latitude"
                    />
                    <Input
                      value={storeForm.longitude}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="Boylam"
                      required
                      data-testid="input-longitude"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="w-full mt-2"
                    data-testid="button-get-location"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Mevcut Konumu Kullan
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Adres</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={storeForm.address}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, address: e.target.value }))}
                      className="pl-10"
                      placeholder="Tam adres"
                      required
                      data-testid="input-address"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Resim URL</label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={storeForm.image}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, image: e.target.value }))}
                      className="pl-10"
                      placeholder="https://..."
                      data-testid="input-image"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Açıklama</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={storeForm.description}
                      onChange={(e) => setStoreForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border rounded-xl resize-none h-24"
                      placeholder="Mağazanızı tanımlayın..."
                      required
                      data-testid="input-description"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-submit-store"
                >
                  {editingStore ? 'Güncelle' : 'Mağaza Ekle'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showDiscountForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
            onClick={() => setShowDiscountForm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Yeni İndirim</h2>
                <button
                  onClick={() => setShowDiscountForm(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDiscountSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">İndirim Başlığı</label>
                  <Input
                    value={discountForm.title}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Örn: Yaz İndirimi"
                    required
                    data-testid="input-discount-title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Açıklama</label>
                  <textarea
                    value={discountForm.description}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl resize-none h-20"
                    placeholder="İndirim detayları..."
                    required
                    data-testid="input-discount-description"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    İndirim Oranı: %{discountForm.discountRate}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={discountForm.discountRate}
                    onChange={(e) => setDiscountForm(prev => ({ ...prev, discountRate: parseInt(e.target.value) }))}
                    className="w-full accent-purple-600"
                    data-testid="input-discount-rate"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Başlangıç</label>
                    <Input
                      type="date"
                      value={discountForm.startDate}
                      onChange={(e) => setDiscountForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Bitiş</label>
                    <Input
                      type="date"
                      value={discountForm.endDate}
                      onChange={(e) => setDiscountForm(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                      data-testid="input-end-date"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-submit-discount"
                >
                  İndirim Ekle
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
