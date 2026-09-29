import React, { useState, useEffect } from 'react';
import { Product, Order, ProductCondition } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReturnInspectionModal } from '../components/ReturnInspectionModal';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import {
  Store,
  DollarSign,
  ShieldAlert,
  Clock,
  Shirt,
  Sparkles,
  Plus,
  CheckCircle2,
  Users,
  Award,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';

export const SellerDashboardPage: React.FC = () => {
  const { currentUser, selectedCity } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [passportProduct, setPassportProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState('Crimson Raw Silk Cape Anarkali');
  const [newCategory, setNewCategory] = useState<Product['category']>('Anarkali');
  const [newBrand, setNewBrand] = useState('Kavita Couture');
  const [newRetail, setNewRetail] = useState<number>(18000);
  const [newRental3Days, setNewRental3Days] = useState<number>(950);
  const [newDeposit, setNewDeposit] = useState<number>(1500);
  const [newProtectionPrice, setNewProtectionPrice] = useState<number>(95);
  const [newSize, setNewSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL'>('M');
  const [newFabric, setNewFabric] = useState('Pure Raw Silk with Zari Cape');
  const [newLocality, setNewLocality] = useState('Alwarpet');
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
  );
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/seller/dashboard', {
        headers: { 'x-user-id': currentUser.id }
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentUser.id]);

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    try {
      const res = await fetch('/api/products/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          retailValue: newRetail
        })
      });
      const data = await res.json();
      if (data) {
        setNewRental3Days(data.suggested3DayRental);
        setNewDeposit(data.suggestedDeposit);
        setNewProtectionPrice(data.suggestedProtection);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleCreateListing = async () => {
    setIsSubmittingListing(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          brand: newBrand,
          colour: 'Crimson Wine',
          fabric: newFabric,
          sizeLabel: newSize,
          rentalPrice3Days: newRental3Days,
          retailValue: newRetail,
          refundableDeposit: newDeposit,
          protectionPrice: newProtectionPrice,
          condition: 'Excellent',
          city: selectedCity,
          locality: newLocality,
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          images: [newImage],
          description: `Handcrafted ${newCategory.toLowerCase()} in ${newFabric}. Immaculate circular piece for weddings and galas.`
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        await fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingListing(false);
    }
  };

  const handleRetireProduct = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}/retire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Retired under circular lifecycle policy', actorId: currentUser.id })
      });
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteInspection = async (params: any) => {
    if (!inspectingOrder) return;
    try {
      await fetch(`/api/orders/${inspectingOrder.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      setInspectingOrder(null);
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#6F747A]">
        Loading seller console...
      </div>
    );
  }

  const { metrics, products, recentOrders, inspectionQueue, membershipPlans, staffAccounts } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
              {currentUser.role === 'B2B_SELLER' ? 'B2B Studio Partner Console' : 'B2C Wardrobe Owner Console'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#197B5B]" />
          </div>
          <h1 className="font-serif-couture text-3xl font-bold text-[#18212B]">
            {currentUser.name}
          </h1>
          <p className="text-xs text-[#6F747A] mt-0.5">
            Active in {selectedCity} · Circular Wardrobe Ledger & Inspection Center
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Occasionwear</span>
        </button>
      </div>

      {/* Metrics Row (Strict Separation of Escrow Deposit from Seller Revenue) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Net Earnings */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
          <span className="text-[10px] uppercase font-bold text-[#6F747A] block">Net Earnings</span>
          <span className="font-serif-couture text-2xl font-bold text-[#18212B] block mt-1">
            ₹{metrics.totalNetEarnings.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#197B5B] font-semibold">After 12% commission</span>
        </div>

        {/* Pending Payout */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
          <span className="text-[10px] uppercase font-bold text-[#6F747A] block">Pending Payout</span>
          <span className="font-serif-couture text-2xl font-bold text-[#781F37] block mt-1">
            ₹{metrics.pendingPayout.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-stone-500">Scheduled to bank</span>
        </div>

        {/* Escrow Deposits Held (Liability Warning) */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
          <span className="text-[10px] uppercase font-bold text-[#C89228] block">Deposits in Escrow</span>
          <span className="font-serif-couture text-2xl font-bold text-[#C89228] block mt-1">
            ₹{metrics.depositsHeldInEscrow.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-stone-500">Held liability (Not revenue)</span>
        </div>

        {/* Active Rentals */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
          <span className="text-[10px] uppercase font-bold text-[#6F747A] block">Active Rentals</span>
          <span className="font-serif-couture text-2xl font-bold text-[#18212B] block mt-1">
            {metrics.activeRentalsCount}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold">Currently with renters</span>
        </div>

        {/* Inspection Queue */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8]">
          <span className="text-[10px] uppercase font-bold text-[#781F37] block">Inspection Queue</span>
          <span className="font-serif-couture text-2xl font-bold text-[#781F37] block mt-1">
            {metrics.inspectionQueueCount}
          </span>
          <span className="text-[10px] text-stone-500">Returns awaiting QC</span>
        </div>
      </div>

      {/* Return Inspection Queue Action Banner (Step 12 Demo Flow) */}
      {inspectionQueue && inspectionQueue.length > 0 && (
        <div className="bg-[#FFF9F1] rounded-3xl p-6 border-2 border-[#781F37] shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#781F37] uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Returned Garment Awaiting QC Inspection ({inspectionQueue.length})</span>
            </div>
            <span className="text-xs text-stone-500">2-Hour SLA for deposit release</span>
          </div>

          <div className="space-y-2">
            {inspectionQueue.map((ord: Order) => (
              <div
                key={ord.id}
                className="bg-white p-4 rounded-2xl border border-[#E8E1D8] flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ord.productImage}
                    alt={ord.productTitle}
                    className="w-14 h-16 object-cover rounded-xl border border-stone-200"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#18212B]">{ord.productTitle}</h4>
                    <p className="text-xs text-stone-500">
                      Order: {ord.orderNumber} · Returned by <strong>{ord.customerName}</strong>
                    </p>
                    <p className="text-[11px] text-[#197B5B] mt-0.5">
                      Customer uploaded return photos. Escrow deposit to release: ₹{ord.pricing.refundableDeposit.toLocaleString('en-IN')}.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingOrder(ord)}
                  className="px-5 py-2.5 bg-[#197B5B] hover:bg-[#146349] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex-shrink-0"
                >
                  Perform QC & Approve Refund
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory & Clothing Passport Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
              Circulating Wardrobe Inventory ({products.length})
            </h3>
            <p className="text-xs text-[#6F747A]">
              Track wear counts, condition history, and Digital Clothing Passports.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-[#6F747A] font-bold uppercase text-[10px]">
                <th className="py-2.5">Piece</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Size</th>
                <th className="py-2.5">Rental / 3 Days</th>
                <th className="py-2.5">Wears Logged</th>
                <th className="py-2.5">Condition</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p: Product) => (
                <tr key={p.id} className="hover:bg-stone-50/80">
                  <td className="py-3 flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-10 h-12 object-cover rounded-lg border border-stone-200"
                    />
                    <div>
                      <span className="font-bold text-[#18212B] block">{p.title}</span>
                      <span className="text-[10px] text-stone-400 font-mono">{p.productCode}</span>
                    </div>
                  </td>
                  <td className="py-3 text-stone-600">{p.category}</td>
                  <td className="py-3 font-semibold">{p.sizeLabel}</td>
                  <td className="py-3 font-bold text-[#18212B]">₹{p.rentalPrice3Days}</td>
                  <td className="py-3">
                    <span className="font-serif-couture font-bold text-sm text-[#781F37]">{p.usageCount}</span>
                    <span className="text-[10px] text-stone-400 ml-1">wears</span>
                  </td>
                  <td className="py-3">
                    <span className="text-[#197B5B] font-semibold">{p.condition}</span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.lifecycleStatus === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.lifecycleStatus === 'RENTED'
                        ? 'bg-blue-100 text-blue-800'
                        : p.lifecycleStatus === 'RETIRED'
                        ? 'bg-stone-200 text-stone-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.lifecycleStatus}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => setPassportProduct(p)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-medium cursor-pointer"
                      title="View Digital Passport"
                    >
                      Passport
                    </button>
                    {p.lifecycleStatus !== 'RETIRED' && (
                      <button
                        onClick={() => handleRetireProduct(p.id)}
                        className="px-2.5 py-1 bg-stone-50 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-lg text-[11px] cursor-pointer"
                        title="Retire garment"
                      >
                        Retire
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* B2B Studio Tools (Membership & Staff) */}
      {currentUser.role === 'B2B_SELLER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Membership Plans */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C89228]" />
              <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                B2B Studio Membership Tier
              </h3>
            </div>
            <div className="space-y-2">
              {membershipPlans.map((plan: any) => (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                    plan.active
                      ? 'border-[#197B5B] bg-[#197B5B]/5 ring-1 ring-[#197B5B]'
                      : 'border-stone-200'
                  }`}
                >
                  <div>
                    <span className="font-bold text-[#18212B] block">{plan.name}</span>
                    <span className="text-stone-500 text-[11px]">
                      Up to {plan.itemLimit} pieces · {plan.commissionPercent}% platform commission
                    </span>
                  </div>
                  {plan.active ? (
                    <span className="text-xs font-bold text-[#197B5B]">Active Tier</span>
                  ) : (
                    <span className="text-xs font-semibold text-stone-600">₹{plan.price}/mo</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Staff Accounts */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#781F37]" />
              <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                Staff & Fitting Leads
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              {staffAccounts.map((staff: any) => (
                <div key={staff.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#18212B] block">{staff.name}</span>
                    <span className="text-stone-500 text-[11px]">{staff.role}</span>
                  </div>
                  <span className="text-[#197B5B] font-bold text-[10px]">Authorized</span>
                </div>
              ))}
              <p className="text-[11px] text-stone-400 pt-1">
                Authorized staff can scan QR pickup passes and record return condition evidence.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Listing Modal with AI Assistant */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-xl max-h-[92vh] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D8] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D8]">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
                  New Circular Listing
                </span>
                <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
                  List Occasionwear
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 text-xs flex-1 pr-1">
              <div>
                <label className="font-bold block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    {['Gown', 'Lehenga', 'Saree', 'Blazer', 'Anarkali', 'Party Dress', 'Kurta Set', 'Sherwani'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Estimated Retail Value (₹)</label>
                  <input
                    type="number"
                    value={newRetail}
                    onChange={(e) => setNewRetail(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                  />
                </div>
              </div>

              {/* AI Suggest Button */}
              <div className="p-3 bg-[#6D4AFF]/10 rounded-2xl border border-[#6D4AFF]/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#6D4AFF] block">AI Pricing & Deposit Assistant</span>
                  <span className="text-[11px] text-stone-600">Calculates competitive local rates based on retail value.</span>
                </div>
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiSuggesting}
                  className="px-3.5 py-1.5 bg-[#6D4AFF] text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C89228]" />
                  <span>{isAiSuggesting ? 'Calculating...' : 'Auto-Suggest'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Rental (3 Days)</label>
                  <input
                    type="number"
                    value={newRental3Days}
                    onChange={(e) => setNewRental3Days(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-[#18212B]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Deposit (Refundable)</label>
                  <input
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold text-[#197B5B]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Protection (₹)</label>
                  <input
                    type="number"
                    value={newProtectionPrice}
                    onChange={(e) => setNewProtectionPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Size</label>
                  <select
                    value={newSize}
                    onChange={(e: any) => setNewSize(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                  >
                    {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Locality in {selectedCity}</label>
                  <input
                    type="text"
                    value={newLocality}
                    onChange={(e) => setNewLocality(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E1D8] flex items-center justify-between">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 font-semibold text-stone-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateListing}
                disabled={isSubmittingListing}
                className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
              >
                {isSubmittingListing ? 'Publishing...' : 'Publish to Wardrobe'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Inspection Modal */}
      {inspectingOrder && (
        <ReturnInspectionModal
          order={inspectingOrder}
          onClose={() => setInspectingOrder(null)}
          onCompleteInspection={handleCompleteInspection}
        />
      )}

      {/* Digital Passport Modal */}
      {passportProduct && (
        <DigitalPassportModal
          product={passportProduct}
          onClose={() => setPassportProduct(null)}
        />
      )}
    </div>
  );
};
