import React, { useState, useEffect } from 'react';
import { Order, DepositRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Camera,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  QrCode
} from 'lucide-react';

interface MyRentalsPageProps {
  onNavigate: (path: string) => void;
  onOpenOrder: (order: Order) => void;
}

export const MyRentalsPage: React.FC<MyRentalsPageProps> = ({ onNavigate, onOpenOrder }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null);
  const [returnPhotos, setReturnPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
  ]);
  const [returnNotes, setReturnNotes] = useState<string>('Gown worn carefully for 4 hours during farewell. Zipper & beading intact.');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  const fetchOrders = async () => {
    try {
      const [ordRes, depRes] = await Promise.all([
        fetch('/api/orders', {
          headers: { 'x-user-id': currentUser.id, 'x-user-role': 'CUSTOMER' }
        }),
        fetch('/api/deposits')
      ]);
      const ordData = await ordRes.json();
      const depData = await depRes.json();
      setOrders(ordData.orders || []);
      setDeposits(depData.deposits || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser.id]);

  const handleReturnSubmit = async (orderId: string) => {
    setIsSubmittingReturn(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnMethod: 'PICKUP',
          returnPhotos,
          customerNotes: returnNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setReturningOrderId(null);
        await fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const getDepositForOrder = (orderId: string) => {
    return deposits.find(d => d.orderId === orderId);
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ACTIVE') return o.status === 'ACTIVE_RENTAL' || o.status === 'INSPECTION_PENDING';
    if (activeTab === 'UPCOMING') return o.status === 'CONFIRMED' || o.status === 'PAYMENT_PENDING';
    if (activeTab === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#781F37] block mb-1">
            Wardrobe Rental Management
          </span>
          <h1 className="font-serif-couture text-3xl font-bold text-[#18212B]">
            My Occasionwear Bookings
          </h1>
          <p className="text-xs text-[#6F747A] mt-1">
            Manage active wear periods, photographic returns, and refundable security deposit tracking.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E8E1D8] shadow-xs text-xs">
          {(['ACTIVE', 'UPCOMING', 'COMPLETED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#781F37] text-white shadow-xs'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E1D8] space-y-3">
          <p className="font-serif-couture text-xl text-[#18212B]">
            No {activeTab.toLowerCase()} rentals found.
          </p>
          <p className="text-xs text-[#6F747A]">
            Discover occasionwear available nearby for upcoming events.
          </p>
          <button
            onClick={() => onNavigate('/catalog')}
            className="px-5 py-2 bg-[#781F37] text-white rounded-xl text-xs font-semibold"
          >
            Browse Wardrobe
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const deposit = getDepositForOrder(order.id);
            const isReturning = returningOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#E8E1D8] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header row: Order # & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#18212B]">{order.orderNumber}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-[#6F747A]">{order.startDate} to {order.endDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      order.status === 'ACTIVE_RENTAL'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'INSPECTION_PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Main Content: Garment Info & Escrow Line */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-2 aspect-[4/5] rounded-2xl overflow-hidden border border-stone-200">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-6 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#781F37] tracking-wider block">
                      {order.productCode} · Curated by {order.sellerName}
                    </span>
                    <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
                      {order.productTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                      <span>Rental: <strong>₹{order.pricing.rentalAmount.toLocaleString('en-IN')}</strong></span>
                      <span>Protection: <strong>{order.protectionPlanSelected ? 'Active' : 'Declined'}</strong></span>
                      <span>Pickup: <strong>{order.fulfilmentMethod}</strong></span>
                    </div>

                    {order.handoverEvidence && (
                      <div className="pt-2 text-xs text-[#197B5B] flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Handover verified with condition checklist photos.</span>
                      </div>
                    )}
                  </div>

                  {/* Escrow Deposit Status Card (Important Product Principle) */}
                  <div className="md:col-span-4 bg-[#FFF9F1] p-4 rounded-2xl border border-[#E8E1D8] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#6F747A] uppercase text-[10px]">
                        Refundable Escrow Deposit
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        deposit?.status === 'REFUNDED'
                          ? 'bg-[#197B5B] text-white'
                          : deposit?.status === 'PARTIALLY_DEDUCTED'
                          ? 'bg-[#C89228] text-white'
                          : 'bg-stone-200 text-stone-800'
                      }`}>
                        {deposit?.status || 'HELD'}
                      </span>
                    </div>

                    <div className="font-serif-couture text-2xl font-bold text-[#197B5B]">
                      ₹{order.pricing.refundableDeposit.toLocaleString('en-IN')}
                    </div>

                    {deposit?.status === 'REFUNDED' && (
                      <p className="text-[11px] text-[#197B5B] leading-tight font-medium">
                        ✓ 100% deposit refund initiated to UPI ({deposit.refundTransactionId}).
                      </p>
                    )}

                    {deposit?.status === 'PARTIALLY_DEDUCTED' && (
                      <p className="text-[11px] text-[#C89228] leading-tight font-medium">
                        Deduction: ₹{deposit.deductionAmount} ({deposit.deductionReason}). Balance refunded.
                      </p>
                    )}

                    {deposit?.status === 'HELD' && (
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Secured in escrow liability account. Released immediately upon post-wear return inspection.
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">Pickup Pass OTP:</span>
                    <span className="font-mono font-bold text-[#781F37]">{order.pickupOtp}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === 'ACTIVE_RENTAL' && !isReturning && (
                      <button
                        onClick={() => setReturningOrderId(order.id)}
                        className="px-4 py-2 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl font-semibold shadow-xs transition cursor-pointer"
                      >
                        Initiate Garment Return
                      </button>
                    )}

                    {order.status === 'INSPECTION_PENDING' && (
                      <span className="text-[#C89228] font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Awaiting Wardrobe Owner Inspection & Deposit Release</span>
                      </span>
                    )}

                    <button
                      onClick={() => onOpenOrder(order)}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold cursor-pointer"
                    >
                      View Booking Details
                    </button>
                  </div>
                </div>

                {/* Inline Return Form Drawer if Renter clicked Return */}
                {isReturning && (
                  <div className="mt-4 p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
                        Initiate Return & Photographic Evidence (Step 11)
                      </h4>
                      <button onClick={() => setReturningOrderId(null)} className="text-xs text-stone-400">
                        Cancel
                      </button>
                    </div>

                    <p className="text-xs text-stone-600">
                      Upload return photos so the wardrobe owner can verify condition and approve your instant 100% deposit refund.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-1">Return Photo (Front & Bodice)</span>
                        <img
                          src={order.productImage}
                          alt="Return Sample"
                          className="w-full h-28 object-cover rounded-xl border border-stone-300"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block mb-1">Return Notes</span>
                        <textarea
                          value={returnNotes}
                          onChange={(e) => setReturnNotes(e.target.value)}
                          rows={4}
                          className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => handleReturnSubmit(order.id)}
                        disabled={isSubmittingReturn}
                        className="px-6 py-2.5 bg-[#197B5B] hover:bg-[#146349] text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                      >
                        {isSubmittingReturn ? 'Submitting Return...' : 'Hand Back Garment & Trigger QC'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
