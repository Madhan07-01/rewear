import React, { useState, useEffect } from 'react';
import { Product, ReViveMetrics, ReViveLiveActivity } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReViveModal } from '../components/ReViveModal';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import {
  Recycle,
  Sparkles,
  HeartHandshake,
  Scissors,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Filter,
  Eye,
  RefreshCw,
  Bell,
  Check,
  DollarSign
} from 'lucide-react';

interface ReViveHubPageProps {
  onNavigate?: (path: string) => void;
  onOpenProductDetail?: (product: Product) => void;
}

export const ReViveHubPage: React.FC<ReViveHubPageProps> = ({
  onNavigate,
  onOpenProductDetail
}) => {
  const { currentUser, selectedCity } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'NEEDS_ACTION' | 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'COMPLETED'
  >('NEEDS_ACTION');

  const [metrics, setMetrics] = useState<ReViveMetrics | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [activities, setActivities] = useState<ReViveLiveActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedProductForReVive, setSelectedProductForReVive] = useState<Product | null>(null);
  const [initialRoute, setInitialRoute] = useState<'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE' | undefined>(undefined);
  const [passportProduct, setPassportProduct] = useState<Product | null>(null);

  const fetchReViveData = async () => {
    try {
      setLoading(true);
      const [resMetrics, resQueue, resActivities] = await Promise.all([
        fetch('/api/revive/metrics', { headers: { 'x-user-id': currentUser.id } }),
        fetch('/api/revive/queue', { headers: { 'x-user-id': currentUser.id } }),
        fetch('/api/revive/activities')
      ]);

      const dataMetrics = await resMetrics.json();
      const dataQueue = await resQueue.json();
      const dataActivities = await resActivities.json();

      if (dataMetrics.metrics) setMetrics(dataMetrics.metrics);
      if (dataQueue.queue) setQueue(dataQueue.queue);
      if (dataActivities.activities) setActivities(dataActivities.activities);
    } catch (err) {
      console.error('Error fetching ReVive data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReViveData();
  }, [currentUser.id]);

  const handleOpenReViveModal = (
    product: Product,
    route?: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE'
  ) => {
    setSelectedProductForReVive(product);
    setInitialRoute(route);
  };

  // Filter queue based on active tab
  const filteredQueue = queue.filter(item => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'NEEDS_ACTION') return item.needsAction && !item.isCompleted;
    if (activeTab === 'REPAIR') return item.recommendedRoute === 'REPAIR' || item.product.lifecycleStatus === 'IN_REPAIR';
    if (activeTab === 'DONATE') return item.recommendedRoute === 'DONATE' || item.product.lifecycleStatus === 'DONATION_SCHEDULED' || item.product.lifecycleStatus === 'DONATED';
    if (activeTab === 'UPCYCLE') return item.recommendedRoute === 'UPCYCLE' || item.product.lifecycleStatus === 'UPCYCLING_PENDING' || item.product.lifecycleStatus === 'UPCYCLED';
    if (activeTab === 'RECYCLE') return item.recommendedRoute === 'RECYCLE' || item.product.lifecycleStatus === 'RECYCLING_SCHEDULED' || item.product.lifecycleStatus === 'RECYCLED';
    if (activeTab === 'COMPLETED') return item.isCompleted;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 animate-fade-in">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#18212B] via-[#25303D] to-[#197B5B]/90 text-white p-6 sm:p-10 shadow-xl overflow-hidden border border-[#E8E1D8]">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#C89228]/15 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#197B5B]/30 border border-[#197B5B]/50 text-[#197B5B] text-xs font-bold uppercase tracking-wider">
              <Recycle className="w-4 h-4 text-[#197B5B]" />
              ReVive
            </span>
            <span className="text-xs text-stone-300 font-medium">
              Circular End-of-Life & Next-Life Center
            </span>
          </div>

          <h1 className="font-serif-couture text-3xl sm:text-5xl font-bold tracking-tight">
            Give Every Garment a Second Life
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-light">
            Before retiring an item, discover repair, donation, upcycling and recycling options near you. Keep precious textiles in circular rotation across Chennai.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
              Verified NGO Donating & 80G Receipts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
              Recycling Payout: ₹25–₹40 / kg
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
              Artisan Upcycling Cooperatives
            </span>
          </div>
        </div>
      </div>

      {/* Seller Notification Activity Banner (Prompt items) */}
      {activities.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-[#E8E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18212B] uppercase tracking-wider">
              <Bell className="w-4 h-4 text-[#781F37]" />
              <span>Seller ReVive Notifications & Next-Life Alerts</span>
            </div>
            <span className="text-xs text-stone-400">Live Status Feed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activities.slice(0, 3).map(act => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-2 hover:border-[#197B5B] transition cursor-pointer"
                onClick={() => {
                  const targetProd = queue.find(q => q.product.productCode === act.productCode)?.product;
                  if (targetProd) {
                    handleOpenReViveModal(targetProd);
                  }
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-[#781F37] font-bold">{act.productCode}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        act.badgeColor === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : act.badgeColor === 'emerald'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.badgeColor === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {act.badgeText}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#18212B] line-clamp-1">{act.statusText}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{act.details}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/60">
                  <span>{act.timeAgo}</span>
                  <span className="font-bold text-[#781F37] hover:underline flex items-center gap-0.5">
                    {act.ctaText} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <span className="text-[10px] uppercase font-bold text-[#781F37] block">Needs Decision</span>
            <span className="font-serif-couture text-2xl font-bold text-[#781F37] block mt-0.5">
              {metrics.itemsNeedingAction}
            </span>
            <span className="text-[10px] text-stone-500">Unused garments</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <span className="text-[10px] uppercase font-bold text-[#197B5B] block">Donations Completed</span>
            <span className="font-serif-couture text-2xl font-bold text-[#197B5B] block mt-0.5">
              {metrics.donationsCompleted}
            </span>
            <span className="text-[10px] text-stone-500">Pieces to trusts</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <span className="text-[10px] uppercase font-bold text-[#C89228] block">Recycling In Progress</span>
            <span className="font-serif-couture text-2xl font-bold text-[#C89228] block mt-0.5">
              {metrics.recyclingRequestsActive}
            </span>
            <span className="text-[10px] text-stone-500">Hub quotes & passes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Recycler Earnings</span>
            <span className="font-serif-couture text-2xl font-bold text-amber-800 block mt-0.5">
              ₹{metrics.recyclerEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-stone-500">Direct wallet credit</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <span className="text-[10px] uppercase font-bold text-purple-700 block">Upcycled Crafts</span>
            <span className="font-serif-couture text-2xl font-bold text-purple-800 block mt-0.5">
              {metrics.garmentsUpcycled}
            </span>
            <span className="text-[10px] text-stone-500">Heirloom potlis</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <span className="text-[10px] uppercase font-bold text-[#18212B] block">Textile Diverted</span>
            <span className="font-serif-couture text-2xl font-bold text-[#18212B] block mt-0.5">
              {metrics.textileDivertedKg.toFixed(1)} kg
            </span>
            <span className="text-[10px] text-[#197B5B] font-semibold">Zero landfill</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-[#E8E1D8] pb-3 overflow-x-auto gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'NEEDS_ACTION', label: 'Needs Action' },
            { id: 'ALL', label: 'All Items' },
            { id: 'REPAIR', label: 'Repair & Relist' },
            { id: 'DONATE', label: 'Donate' },
            { id: 'UPCYCLE', label: 'Upcycle' },
            { id: 'RECYCLE', label: 'Recycle' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#781F37] text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-[#E8E1D8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchReViveData}
          className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 cursor-pointer"
          title="Refresh queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Product Queue Cards / Table */}
      <div className="space-y-4">
        {filteredQueue.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1D8] space-y-3">
            <Recycle className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
              No garments in this filter
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              All items in this category are active in regular rental circulation or have concluded their next life cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQueue.map(item => {
              const { product, recommendedRoute, nearestPartnerCount, estimatedRecyclerPayout } = item;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-[#E8E1D8] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Top Image & Badge */}
                    <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#18212B]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono">
                        {product.productCode}
                      </div>

                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            product.condition.toLowerCase().includes('damage')
                              ? 'bg-red-100 text-red-800'
                              : product.condition === 'Fair'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.condition} Condition
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-stone-200">
                        <span className="text-stone-600 font-medium">
                          {product.usageCount} wears · {product.repairsCount} repairs
                        </span>
                        <span className="font-bold text-[#781F37]">
                          Status: {product.lifecycleStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">
                          {product.category} · {product.fabric}
                        </span>
                        <h3 className="font-serif-couture text-lg font-bold text-[#18212B] line-clamp-1">
                          {product.title}
                        </h3>
                      </div>

                      {/* Transparent Rule-Based Recommendation Box */}
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase font-bold text-stone-500">
                            Recommended Next Life:
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              recommendedRoute === 'DONATE'
                                ? 'bg-[#197B5B]/15 text-[#197B5B]'
                                : recommendedRoute === 'RECYCLE'
                                ? 'bg-amber-100 text-amber-800'
                                : recommendedRoute === 'UPCYCLE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {recommendedRoute}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-snug">
                          {item.recommendationReason}
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500 border-t border-stone-200/50">
                          <span>{nearestPartnerCount} verified partners nearby</span>
                          {recommendedRoute === 'RECYCLE' && (
                            <span className="font-semibold text-amber-800">
                              Est. Payout: ₹{estimatedRecyclerPayout}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setPassportProduct(product)}
                      className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition cursor-pointer"
                      title="Inspect Passport"
                    >
                      Passport
                    </button>

                    <button
                      onClick={() => handleOpenReViveModal(product, recommendedRoute)}
                      className="flex-1 py-2.5 px-4 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore ReVive Options</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guided ReVive Flow Modal */}
      {selectedProductForReVive && (
        <ReViveModal
          product={selectedProductForReVive}
          initialRoute={initialRoute}
          onClose={() => setSelectedProductForReVive(null)}
          onSuccess={() => {
            fetchReViveData();
          }}
        />
      )}

      {/* Digital Clothing Passport Modal */}
      {passportProduct && (
        <DigitalPassportModal
          product={passportProduct}
          onClose={() => setPassportProduct(null)}
        />
      )}
    </div>
  );
};
