import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import { Sparkles, ArrowRight, ShieldCheck, RefreshCw, HeartHandshake, CheckCircle2, MapPin, Search } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectProduct }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedPassportProduct, setSelectedPassportProduct] = useState<Product | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Farewell');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setFeaturedProducts(data.products.slice(0, 8));
        }
      })
      .catch(console.error);
  }, []);

  const occasions = [
    'Farewell',
    'College Fest',
    'Wedding',
    'Interview',
    'Party',
    'Photoshoot',
    'Traditional',
    'Formal'
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-[#E8E1D8]">
        {/* Subtle decorative radial gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-[#C89228]/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            {/* Mission Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#197B5B]/10 border border-[#197B5B]/20 text-[#197B5B] text-xs font-semibold mb-4 sm:mb-6">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hyperlocal Circular Occasionwear</span>
            </div>

            {/* Campaign Headline */}
            <h1 className="font-serif-couture text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#18212B] leading-[1.08] mb-6">
              Wear the moment.<br />
              <span className="italic font-normal text-[#781F37]">Not the price tag.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#6F747A] leading-relaxed max-w-2xl mb-8">
              Why buy expensive outfits for one wedding, farewell, interview, or photoshoot? Rent, buy, and share verified designer wardrobe treasures right in your neighbourhood.
            </p>

            {/* Hero Interactive Search & CTAs */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#E8E1D8] shadow-lg max-w-2xl mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
                  <Search className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onNavigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
                      }
                    }}
                    placeholder="Search gown, lehenga, blazer, farewell..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#18212B] placeholder:text-stone-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => onNavigate('/style-match')}
                  className="w-full sm:w-auto px-6 py-3 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#C89228]" />
                  <span>AI Style Match</span>
                </button>
              </div>

              {/* Occasion Interactive Chips */}
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[#6F747A] font-medium mr-1 flex-shrink-0">Occasion:</span>
                {occasions.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => {
                      setSelectedOccasion(occ);
                      onNavigate(`/catalog?occasion=${encodeURIComponent(occ)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#781F37] hover:text-white text-stone-700 transition font-medium flex-shrink-0 cursor-pointer"
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Mini Strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#6F747A] font-medium">
              <span className="flex items-center gap-1.5 text-[#197B5B]">
                <ShieldCheck className="w-4 h-4" /> 100% Refundable Escrow Deposits
              </span>
              <span className="flex items-center gap-1.5 text-[#18212B]">
                <MapPin className="w-4 h-4 text-[#781F37]" /> Hyperlocal 2-Hour Pickup
              </span>
              <span className="flex items-center gap-1.5 text-[#18212B]">
                <CheckCircle2 className="w-4 h-4 text-[#C89228]" /> Sanitized & Condition-Checked
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Occasionwear Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-[#781F37] mb-1">
              Hyperlocal Chennai Wardrobes
            </div>
            <h2 className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#18212B]">
              Ready for Your Big Moment
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/catalog')}
            className="text-xs font-semibold text-[#781F37] hover:text-[#5E182B] flex items-center gap-1 transition cursor-pointer"
          >
            <span>View All 20+ Nearby Outfits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onOpenPassport={(p) => setSelectedPassportProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* High-Value Couture Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#18212B] text-white rounded-3xl p-6 sm:p-10 border border-[#C89228]/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89228]/20 text-[#C89228] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> High-Value Archival Couture
            </div>
            <h3 className="font-serif-couture text-3xl sm:text-4xl font-bold text-[#FFF9F1]">
              Designer Ivory Embellished Lehenga
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Retail value ₹35,000 · Rent for ₹4,000 / 3 days with enhanced protection. Handcrafted with micro-pearls, gota patti, and mukaish work. Includes identity verification & QR handover.
            </p>
            <div className="flex items-center gap-6 pt-2 text-xs">
              <div>
                <span className="text-stone-400 block">Refundable Escrow</span>
                <span className="font-bold text-[#197B5B] text-sm">₹8,000</span>
              </div>
              <div className="border-l border-white/20 pl-6">
                <span className="text-stone-400 block">Distance</span>
                <span className="font-bold text-white text-sm">3.4 km · Nungambakkam</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/product/prod_lhn_5008')}
                className="px-6 py-3 bg-[#C89228] hover:bg-[#b07d1e] text-[#18212B] font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
              >
                Inspect Premium Lehenga
              </button>
            </div>
          </div>

          <div className="w-full md:w-72 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/20 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Designer Ivory Lehenga"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How ReWear Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E8E1D8] pt-14">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-wider font-bold text-[#197B5B] block mb-1">
            Circular Model
          </span>
          <h2 className="font-serif-couture text-3xl font-bold text-[#18212B]">
            How ReWear Protects Renter & Wardrobe Owner
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D8]">
            <div className="w-10 h-10 rounded-xl bg-[#6D4AFF]/10 text-[#6D4AFF] flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h4 className="font-bold text-sm text-[#18212B] mb-1">AI Style & Fit Match</h4>
            <p className="text-xs text-[#6F747A] leading-relaxed">
              Match your exact body measurements and occasion aesthetic with nearby pieces within 5 km.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D8]">
            <div className="w-10 h-10 rounded-xl bg-[#781F37]/10 text-[#781F37] flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h4 className="font-bold text-sm text-[#18212B] mb-1">Escrow Deposit Held</h4>
            <p className="text-xs text-[#6F747A] leading-relaxed">
              Refundable security deposits are held in a segregated escrow liability account, never counted as revenue.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D8]">
            <div className="w-10 h-10 rounded-xl bg-[#197B5B]/10 text-[#197B5B] flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h4 className="font-bold text-sm text-[#18212B] mb-1">QR Handover Evidence</h4>
            <p className="text-xs text-[#6F747A] leading-relaxed">
              Dual QR and OTP scans confirm handover with immediate photographic condition checks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E1D8]">
            <div className="w-10 h-10 rounded-xl bg-[#C89228]/10 text-[#C89228] flex items-center justify-center font-bold mb-4">
              4
            </div>
            <h4 className="font-bold text-sm text-[#18212B] mb-1">Instant Return & Refund</h4>
            <p className="text-xs text-[#6F747A] leading-relaxed">
              Quick QC inspection approves 100% deposit return immediately, incrementing the garment's Digital Passport.
            </p>
          </div>
        </div>
      </section>

      {/* Seller Onboarding CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#781F37] to-[#5E182B] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-serif-couture text-3xl font-bold text-[#FFF9F1] mb-2">
              Have Occasionwear Sitting Idle in Your Closet?
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Monetize pre-loved gowns, lehengas, and blazers safely. Our AI automatically suggests prices, deposits, and sizes. You retain full control over bookings and return approvals.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/seller')}
            className="px-6 py-3.5 bg-white text-[#781F37] hover:bg-[#FFF9F1] font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md flex-shrink-0"
          >
            Open Seller Console
          </button>
        </div>
      </section>

      {/* Digital Passport Modal */}
      {selectedPassportProduct && (
        <DigitalPassportModal
          product={selectedPassportProduct}
          onClose={() => setSelectedPassportProduct(null)}
        />
      )}
    </div>
  );
};
