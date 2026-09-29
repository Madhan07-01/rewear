import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import { AiFitPreviewModal } from '../components/AiFitPreviewModal';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Heart,
  Ruler,
  RefreshCw,
  Shirt,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  Share2,
  ArrowLeft
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (path: string) => void;
  onStartCheckout: (product: Product) => void;
  initialAction?: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onStartCheckout,
  initialAction
}) => {
  const { savedProductIds, toggleSaveProduct } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPassport, setShowPassport] = useState(false);
  const [showTryOn, setShowTryOn] = useState(initialAction === 'tryon');
  const [selectedSize, setSelectedSize] = useState<string>('M');

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          setSelectedSize(data.product.sizeLabel);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-[#6F747A]">
        Loading garment details...
      </div>
    );
  }

  const isSaved = savedProductIds.includes(product.id);
  const isHighValue = product.premiumTier === 'HIGH_VALUE' || product.premiumTier === 'LUXURY';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('/catalog')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-black mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Wardrobe Catalog</span>
      </button>

      {/* Main Grid: Gallery + Product Specification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] bg-stone-100 rounded-3xl overflow-hidden border border-[#E8E1D8] shadow-md">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toggleSaveProduct(product.id)}
                className="p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md transition cursor-pointer"
                title="Save outfit"
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-[#781F37] text-[#781F37]' : ''}`} />
              </button>
            </div>

            {/* Proximity Pill */}
            <div className="absolute bottom-4 left-4 bg-[#18212B]/90 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md">
              <MapPin className="w-3.5 h-3.5 text-[#C89228]" />
              <span>{product.approxDistanceKm} km away in {product.locality}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                    activeImageIndex === idx ? 'border-[#781F37] ring-2 ring-[#781F37]/30' : 'border-[#E8E1D8]'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details, Pricing, Measurements & Actions (7 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Metadata & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#6F747A] uppercase tracking-wider mb-1.5">
              <span>{product.category}</span>
              <span>·</span>
              <span className="font-mono text-[#18212B]">{product.productCode}</span>
              <span>·</span>
              <span className="text-[#197B5B] flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" /> Condition: {product.condition}
              </span>
            </div>

            <h1 className="font-serif-couture text-3xl sm:text-4xl font-bold text-[#18212B]">
              {product.title}
            </h1>

            <p className="text-xs text-[#6F747A] mt-1">
              Curated by <strong>{product.sellerName}</strong> ({product.sellerRating} ★ Local Rating)
            </p>
          </div>

          {/* Transparent Pricing & Refundable Deposit Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] shadow-xs">
            <div className="flex items-baseline justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs text-[#6F747A] block font-medium">Rental Charge (3 Days)</span>
                <span className="font-serif-couture text-3xl font-bold text-[#18212B]">
                  ₹{product.rentalPrice3Days.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-stone-400 ml-1">/ ₹{product.rentalPricePerDay}/day</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6F747A] block font-medium">Refundable Deposit</span>
                <span className="text-xl font-bold text-[#197B5B]">
                  ₹{product.refundableDeposit.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#197B5B] font-semibold block">100% Escrow Protected</span>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-2 text-xs text-[#197B5B] bg-[#197B5B]/5 p-2.5 rounded-xl border border-[#197B5B]/20">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Deposit Guarantee:</strong> ₹{product.refundableDeposit.toLocaleString('en-IN')} is held securely in escrow and returned immediately upon post-event inspection.
              </span>
            </div>
          </div>

          {/* High Value Positive Eligibility Message if Applicable (Step 15) */}
          {isHighValue && (
            <div className="bg-[#FFF9F1] p-4 rounded-2xl border-2 border-[#C89228] shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C89228] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>High-Value Archival Garment (Retail: ₹{product.retailValue.toLocaleString('en-IN')})</span>
              </div>
              <p className="text-xs text-[#18212B] leading-relaxed">
                <strong>Additional verification required:</strong> This couture piece includes enhanced protection for both you and the owner. Requires verified payment method and QR handover checklist.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F747A]">Description</h4>
            <p className="text-xs text-stone-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Garment Measurements & Size */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#781F37]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#18212B]">
                  Garment Seam Measurements ({product.sizeLabel})
                </h4>
              </div>
              <button
                onClick={() => setShowTryOn(true)}
                className="text-xs text-[#6D4AFF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Fit Simulation</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <div>
                <span className="text-[#6F747A] block text-[10px]">Bust</span>
                <span className="font-bold text-[#18212B]">{product.measurements.bust}"</span>
              </div>
              <div>
                <span className="text-[#6F747A] block text-[10px]">Waist</span>
                <span className="font-bold text-[#18212B]">{product.measurements.waist}"</span>
              </div>
              <div>
                <span className="text-[#6F747A] block text-[10px]">Hip</span>
                <span className="font-bold text-[#18212B]">{product.measurements.hip}"</span>
              </div>
              <div>
                <span className="text-[#6F747A] block text-[10px]">Length</span>
                <span className="font-bold text-[#18212B]">{product.measurements.length}"</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 italic">
              * {product.fitNotes}
            </p>
          </div>

          {/* Circular Passport Strip */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#197B5B]/10 text-[#197B5B] flex items-center justify-center font-bold">
                <Shirt className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#18212B]">
                  Digital Clothing Passport ({product.usageCount} Wears)
                </div>
                <div className="text-[11px] text-[#6F747A]">
                  Maintained with botanical sanitization & registered care log.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPassport(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#18212B] hover:text-[#781F37] border border-[#E8E1D8] bg-white rounded-lg hover:bg-stone-50 cursor-pointer shadow-xs"
            >
              Inspect Passport
            </button>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowTryOn(true)}
              className="flex-1 py-3 px-4 bg-white border border-[#6D4AFF] text-[#6D4AFF] hover:bg-[#6D4AFF]/5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C89228]" />
              <span>AI Fit Preview (Compare S/M/L)</span>
            </button>

            <button
              onClick={() => onStartCheckout(product)}
              className="flex-1 py-3.5 px-6 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer text-center"
            >
              Reserve Outfit Now
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Reservation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#E8E1D8] p-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-stone-500 block">3-Day Rental</span>
          <span className="font-serif-couture text-lg font-bold text-[#18212B]">
            ₹{product.rentalPrice3Days.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-[#197B5B] block">+ ₹{product.refundableDeposit} deposit</span>
        </div>
        <button
          onClick={() => onStartCheckout(product)}
          className="px-6 py-2.5 bg-[#781F37] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Reserve Outfit
        </button>
      </div>

      {/* Digital Passport Modal */}
      {showPassport && (
        <DigitalPassportModal
          product={product}
          onClose={() => setShowPassport(false)}
        />
      )}

      {/* AI Try-On & Fit Modal */}
      {showTryOn && (
        <AiFitPreviewModal
          product={product}
          onClose={() => setShowTryOn(false)}
          onSelectSize={(s) => {
            setSelectedSize(s);
            onStartCheckout(product);
          }}
        />
      )}
    </div>
  );
};
