import React from 'react';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { Heart, Sparkles, MapPin, ShieldCheck, Shirt, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  matchScore?: number;
  fitConfidence?: 'High' | 'Medium' | 'Low';
  matchReason?: string;
  onSelect: (product: Product) => void;
  onOpenPassport?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  matchScore,
  fitConfidence,
  matchReason,
  onSelect,
  onOpenPassport
}) => {
  const { savedProductIds, toggleSaveProduct } = useAuth();
  const isSaved = savedProductIds.includes(product.id);

  return (
    <div className="group bg-white rounded-2xl border border-[#E8E1D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Container with 4:5 Portrait Ratio */}
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges / Indicators (Quiet Unboxed Visuals) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {matchScore ? (
            <div className="bg-[#18212B]/90 backdrop-blur-xs text-[#FFF9F1] px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C89228]" />
              <span>{matchScore}% Match</span>
            </div>
          ) : product.premiumTier !== 'STANDARD' ? (
            <div className="bg-[#C89228]/95 backdrop-blur-xs text-[#18212B] px-2.5 py-1 rounded-md text-xs font-bold shadow-sm tracking-wide">
              High Value Couture
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xs text-[#18212B] px-2.5 py-1 rounded-md text-xs font-medium shadow-xs">
              Size {product.sizeLabel}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveProduct(product.id);
            }}
            className="p-2 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-[#781F37] shadow-sm pointer-events-auto transition cursor-pointer"
            title="Save to Wardrobe"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#781F37] text-[#781F37]' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Overlay: Proximity & Verified Wardrobe */}
        <div className="absolute bottom-2 left-2 right-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 rounded-lg text-white text-xs flex items-center justify-between">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-[#C89228]" />
            <span className="truncate">{product.approxDistanceKm} km · {product.locality}</span>
          </div>
          {product.sellerVerified && (
            <div className="flex items-center gap-1 text-[#197B5B] bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#197B5B]" />
              <span>Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand Metadata (Zero-Pill Typography) */}
          <div className="flex items-center gap-1.5 text-xs text-[#6F747A] mb-1 font-medium">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.usageCount} wears</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-medium text-[#18212B] hover:text-[#781F37] transition-colors text-base line-clamp-1 cursor-pointer"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Match Reason Banner if provided */}
          {matchReason && (
            <p className="text-xs text-[#197B5B] font-medium mt-1 line-clamp-1">
              ✓ {matchReason}
            </p>
          )}

          {/* Pricing and Deposit Line (Transparently separated) */}
          <div className="mt-3 pt-3 border-t border-[#E8E1D8]">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-lg font-bold text-[#18212B]">
                  ₹{product.rentalPrice3Days.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#6F747A] ml-1">/ 3 days</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6F747A]">Deposit: </span>
                <span className="text-xs font-semibold text-[#197B5B]">
                  ₹{product.refundableDeposit.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-400 block leading-none">100% Refundable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="mt-4 pt-3 flex items-center gap-2">
          {onOpenPassport && (
            <button
              onClick={() => onOpenPassport(product)}
              className="px-2.5 py-1.5 text-xs font-semibold text-[#18212B] hover:text-[#781F37] bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer flex items-center gap-1"
              title="Inspect Digital Clothing Passport"
            >
              <Shirt className="w-3.5 h-3.5 text-[#197B5B]" />
              <span className="hidden sm:inline">Passport</span>
            </button>
          )}

          <button
            onClick={() => onSelect(product)}
            className="flex-1 py-1.5 px-3 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer text-center"
          >
            Reserve Outfit
          </button>
        </div>
      </div>
    </div>
  );
};
