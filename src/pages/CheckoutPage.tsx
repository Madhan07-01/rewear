import React, { useState } from 'react';
import { Product, Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Truck, CheckCircle2, AlertCircle, ArrowLeft, Lock } from 'lucide-react';

interface CheckoutPageProps {
  product: Product;
  onNavigate: (path: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  product,
  onNavigate,
  onOrderSuccess
}) => {
  const { currentUser } = useAuth();

  // Checkout Form State
  const [fulfilmentMethod, setFulfilmentMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('No. 42, G.N. Chetty Road, T. Nagar, Chennai - 600017');
  const [protectionSelected, setProtectionSelected] = useState<boolean>(true);
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Pricing math
  const rentalAmount = product.rentalPrice3Days;
  const refundableDeposit = product.refundableDeposit;
  const deliveryCharge = fulfilmentMethod === 'DELIVERY' ? product.deliveryCharge : 0;
  const protectionAmount = protectionSelected ? product.protectionPrice : 0;
  const platformFee = 49;
  const totalPaidToday = rentalAmount + refundableDeposit + deliveryCharge + protectionAmount + platformFee;

  const handlePay = async () => {
    if (!policyAccepted) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerId: currentUser.id,
          customerName: currentUser.name,
          startDate: '2026-10-03',
          endDate: '2026-10-06',
          rentalDays: 3,
          fulfilmentMethod,
          deliveryAddress: fulfilmentMethod === 'DELIVERY' ? deliveryAddress : `${product.locality} Wardrobe Hub`,
          protectionPlanSelected: protectionSelected
        })
      });

      const data = await res.json();
      if (data.success && data.order) {
        onOrderSuccess(data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => onNavigate(`/product/${product.id}`)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-black mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Garment Details</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Fulfilment, Protection, Policies (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <h1 className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#18212B]">
              Reserve Your Occasionwear
            </h1>
            <p className="text-xs text-[#6F747A] mt-0.5">
              Secure checkout with segregated escrow deposit guarantee.
            </p>
          </div>

          {/* 1. Fulfilment Method Choice */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
              1. Choose Fulfilment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* In-Person Pickup */}
              <div
                onClick={() => setFulfilmentMethod('PICKUP')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  fulfilmentMethod === 'PICKUP'
                    ? 'border-[#197B5B] bg-[#197B5B]/5 ring-1 ring-[#197B5B]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#18212B]">In-Person Pickup</span>
                  <span className="text-[10px] font-bold text-[#197B5B] bg-emerald-100 px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Pick up at {product.locality} Hub ({product.approxDistanceKm} km away). Instant QR scan.
                </p>
              </div>

              {/* Hyperlocal Courier Delivery */}
              <div
                onClick={() => setFulfilmentMethod('DELIVERY')}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  fulfilmentMethod === 'DELIVERY'
                    ? 'border-[#781F37] bg-[#781F37]/5 ring-1 ring-[#781F37]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#18212B]">Doorstep Courier</span>
                  <span className="text-[11px] font-bold text-stone-800">
                    ₹{product.deliveryCharge}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Same-day sanitized delivery by verified hyperlocal courier partner.
                </p>
              </div>
            </div>

            {fulfilmentMethod === 'DELIVERY' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-[#18212B] block mb-1">
                  Delivery Address in {product.city}
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>
            )}
          </div>

          {/* 2. Optional Rental Protection */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
                  2. Rental Protection Add-On
                </h3>
                <span className="text-xs font-bold text-[#18212B]">
                  Accidental Spill & Hem Repair Coverage (₹{product.protectionPrice})
                </span>
              </div>
              <input
                type="checkbox"
                checked={protectionSelected}
                onChange={(e) => setProtectionSelected(e.target.checked)}
                className="w-4 h-4 text-[#781F37] rounded focus:ring-[#781F37] cursor-pointer"
              />
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Covers minor food spills, wine stains, seam loosening, and hem scuffs during the farewell party up to ₹5,000 without deducting from your security deposit.
            </p>
          </div>

          {/* 3. Transparent Deposit & Cancellation Policy */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <h4 className="font-bold text-[#18212B]">ReWear Fair Play Policy Preview:</h4>
            <ul className="space-y-1 text-stone-600">
              <li>• <strong>Cancellation:</strong> Full 100% refund including deposit if cancelled 24h before pickup.</li>
              <li>• <strong>Deposit Release:</strong> ₹{product.refundableDeposit.toLocaleString('en-IN')} held securely in escrow. Released within 2 hours of return QC.</li>
            </ul>

            <label className="flex items-start gap-2 pt-2 text-[11px] text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#781F37] focus:ring-[#781F37]"
              />
              <span>
                I agree to the circular rental terms and authorize holding ₹{product.refundableDeposit.toLocaleString('en-IN')} in escrow.
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay (5 Cols) */}
        <div className="md:col-span-5">
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-lg sticky top-24 space-y-4">
            <h3 className="font-serif-couture text-lg font-bold text-[#18212B] pb-2 border-b border-stone-100">
              Payment Breakdown
            </h3>

            {/* Product Snapshot */}
            <div className="flex gap-3 pb-3 border-b border-stone-100">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-16 h-20 object-cover rounded-xl border border-stone-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-[#781F37] tracking-wider block">
                  {product.category} · Size {product.sizeLabel}
                </span>
                <h4 className="text-xs font-bold text-[#18212B] truncate">{product.title}</h4>
                <p className="text-[11px] text-stone-500 mt-0.5">3-Day Rental Window</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-700">
                <span>Rental Charge (3 Days)</span>
                <span className="font-semibold text-[#18212B]">₹{rentalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Prominent Refundable Deposit Line (Requirement) */}
              <div className="flex justify-between items-center p-2 bg-[#197B5B]/10 rounded-xl border border-[#197B5B]/30">
                <div>
                  <span className="font-bold text-[#197B5B] block">Refundable Security Deposit</span>
                  <span className="text-[10px] text-stone-500 block">Returned upon inspection</span>
                </div>
                <span className="font-bold text-sm text-[#197B5B]">
                  ₹{refundableDeposit.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-stone-700">
                <span>Fulfilment ({fulfilmentMethod === 'PICKUP' ? 'Hub Pickup' : 'Courier'})</span>
                <span className="font-semibold">{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>

              {protectionSelected && (
                <div className="flex justify-between text-stone-700">
                  <span>Rental Protection Plan</span>
                  <span className="font-semibold">₹{protectionAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-700">
                <span>Platform & Sanitization Fee</span>
                <span className="font-semibold">₹{platformFee}</span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-sm text-[#18212B] block">Total Payable Today</span>
                  <span className="text-[10px] text-[#197B5B] font-semibold block">
                    (Includes ₹{refundableDeposit.toLocaleString('en-IN')} refundable deposit)
                  </span>
                </div>
                <span className="font-serif-couture text-2xl font-bold text-[#781F37]">
                  ₹{totalPaidToday.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing || !policyAccepted}
              className="w-full py-3.5 bg-[#781F37] hover:bg-[#5E182B] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Confirming Escrow & Booking...'
                  : `Pay ₹${totalPaidToday.toLocaleString('en-IN')} via UPI / Card`}
              </span>
            </button>

            <div className="text-center text-[10px] text-stone-400">
              Demo transaction simulated securely · No actual money charged
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
