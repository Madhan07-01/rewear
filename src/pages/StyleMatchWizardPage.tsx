import React, { useState } from 'react';
import { Product, RecommendationMatchResult, UserMeasurements } from '../types';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import { Sparkles, Calendar, Ruler, IndianRupee, MapPin, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Filter } from 'lucide-react';

interface StyleMatchWizardPageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const StyleMatchWizardPage: React.FC<StyleMatchWizardPageProps> = ({
  onNavigate,
  onSelectProduct
}) => {
  const { currentUser, selectedCity } = useAuth();

  // Wizard Step State
  const [step, setStep] = useState<number>(1);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResults, setMatchResults] = useState<RecommendationMatchResult[] | null>(null);
  const [selectedPassportProduct, setSelectedPassportProduct] = useState<Product | null>(null);

  // Form State initialized to Ananya's College Farewell demo scenario
  const [occasion, setOccasion] = useState<string>('Farewell');
  const [eventDate, setEventDate] = useState<string>('2026-10-03');
  const [returnDate, setReturnDate] = useState<string>('2026-10-06');
  const [size, setSize] = useState<string>('M');
  const [styleMood, setStyleMood] = useState<string>('Glam');
  const [maxBudget, setMaxBudget] = useState<number>(1000);
  const [locality, setLocality] = useState<string>('T. Nagar');
  const [preferredFit, setPreferredFit] = useState<'fitted' | 'regular' | 'relaxed' | 'oversized'>('regular');
  const [measurements, setMeasurements] = useState<UserMeasurements>(
    currentUser.measurements || {
      bust: 36,
      waist: 28,
      hip: 38,
      height: 165,
      preferredFit: 'regular'
    }
  );

  const occasions = [
    { label: 'College Farewell', value: 'Farewell', desc: 'Graduation ceremonies, send-offs & evening galas' },
    { label: 'Wedding / Sangeet', value: 'Wedding', desc: 'Opulent guest lehengas, sarees, & sherwanis' },
    { label: 'Placement Interview', value: 'Interview', desc: 'Sharp formal blazers & corporate wear' },
    { label: 'Party / Club Night', value: 'Party', desc: 'Statement dresses & cocktail couture' },
    { label: 'College Fest', value: 'College event', desc: 'Ethnic day & cultural performance outfits' },
    { label: 'Photoshoot / Portfolio', value: 'Photoshoot', desc: 'Striking runway looks & editorial draping' }
  ];

  const styleMoods = ['Glam', 'Modern Traditional', 'Minimal', 'Classic', 'Streetwear', 'Elegant', 'Bold'];

  const handleRunMatch = async () => {
    setIsMatching(true);
    try {
      const res = await fetch('/api/recommendations/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasion,
          styleMood,
          size,
          maxBudget,
          city: selectedCity,
          eventDate,
          userMeasurements: measurements
        })
      });
      const data = await res.json();
      setTimeout(() => {
        setIsMatching(false);
        setMatchResults(data.matches || []);
        setStep(8); // Results step
      }, 900);
    } catch (err) {
      console.error(err);
      setIsMatching(false);
    }
  };

  const bestMatch = matchResults && matchResults.length > 0 ? matchResults[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Wizard Progress Header */}
      {step < 8 && (
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D4AFF]/10 text-[#6D4AFF] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Hyperlocal Outfit Matchmaker</span>
          </div>
          <h1 className="font-serif-couture text-3xl sm:text-4xl font-bold text-[#18212B]">
            Find Your Dream Outfit
          </h1>
          <p className="text-xs text-[#6F747A] mt-1">
            Step {step} of 6 · Hyperlocal matches in {selectedCity}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  num === step
                    ? 'w-8 bg-[#781F37]'
                    : num < step
                    ? 'w-4 bg-[#197B5B]'
                    : 'w-4 bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Occasion */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#18212B]">What is the occasion?</h3>
            <p className="text-xs text-[#6F747A] mt-0.5">
              We calibrate silhouettes, dress codes, and formality levels based on the event.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {occasions.map((occ) => {
              const isSelected = occasion === occ.value;
              return (
                <div
                  key={occ.value}
                  onClick={() => setOccasion(occ.value)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#781F37]/5 border-[#781F37] ring-2 ring-[#781F37]/30'
                      : 'border-[#E8E1D8] hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#18212B]">{occ.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#781F37]" />}
                  </div>
                  <p className="text-xs text-[#6F747A] mt-1">{occ.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Event Date & Duration */}
      {step === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#18212B]">When is your event?</h3>
            <p className="text-xs text-[#6F747A] mt-0.5">
              Only outfits with verified local availability on these dates will be shown.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#18212B] block mb-1">
                Event / Pickup Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E8E1D8] text-xs font-medium text-[#18212B]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#18212B] block mb-1">
                Rental Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E8E1D8] text-xs font-medium text-[#18212B]"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-[#197B5B] flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Standard 3-day rental duration with flexible evening return window.</span>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Size & Measurements */}
      {step === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#18212B]">Size & Measurements</h3>
            <p className="text-xs text-[#6F747A] mt-0.5">
              Garments fit differently across ateliers. We match seam measurements to prevent ill-fitting surprises.
            </p>
          </div>

          {/* Size Pills */}
          <div>
            <label className="text-xs font-bold text-[#18212B] block mb-2">Standard Size</label>
            <div className="grid grid-cols-5 gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`py-2 text-center text-xs font-bold rounded-xl border transition cursor-pointer ${
                    size === s
                      ? 'bg-[#781F37] text-white border-[#781F37]'
                      : 'border-stone-200 hover:bg-stone-50 text-[#18212B]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Measurements Form */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-xs text-stone-600 block mb-1">Bust (inches)</label>
              <input
                type="number"
                value={measurements.bust}
                onChange={(e) => setMeasurements({ ...measurements, bust: Number(e.target.value) })}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 text-center font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-stone-600 block mb-1">Waist (inches)</label>
              <input
                type="number"
                value={measurements.waist}
                onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 text-center font-bold"
              />
            </div>
            <div>
              <label className="text-xs text-stone-600 block mb-1">Hip (inches)</label>
              <input
                type="number"
                value={measurements.hip}
                onChange={(e) => setMeasurements({ ...measurements, hip: Number(e.target.value) })}
                className="w-full p-2 text-xs rounded-xl border border-stone-200 text-center font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Style Mood */}
      {step === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#18212B]">Select Your Style Mood</h3>
            <p className="text-xs text-[#6F747A] mt-0.5">
              Choose the aesthetic vibe that best suits your personality.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {styleMoods.map((mood) => {
              const isSelected = styleMood === mood;
              return (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setStyleMood(mood)}
                  className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#6D4AFF]/10 border-[#6D4AFF] text-[#6D4AFF] ring-2 ring-[#6D4AFF]/30'
                      : 'border-stone-200 text-[#18212B] hover:bg-stone-50'
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Budget */}
      {step === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#18212B]">What is your rental budget?</h3>
            <p className="text-xs text-[#6F747A] mt-0.5">
              For a 3-day rental period (excluding refundable security deposit).
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-stone-500">Target Budget</span>
              <span className="font-serif-couture text-3xl font-bold text-[#781F37]">
                ₹{maxBudget.toLocaleString('en-IN')}
              </span>
            </div>

            <input
              type="range"
              min={400}
              max={5000}
              step={100}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-[#781F37] cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-stone-400">
              <span>₹400 (Casual/College)</span>
              <span>₹1,000 (Farewell/Gala)</span>
              <span>₹5,000+ (High Couture)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(6)}
              className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Location & Review */}
      {step === 6 && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-md max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#18212B]">Hyperlocal Proximity</h3>
            <p className="text-xs text-[#6F747A] mt-0.5">
              Confirm your neighbourhood to prioritize outfits within walking or short driving distance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#781F37]" />
                <span className="font-bold text-[#18212B]">{selectedCity} · {locality}</span>
              </div>
              <span className="text-[#197B5B] font-semibold">Instant local pickup</span>
            </div>

            <div className="p-4 bg-[#FFF9F1] rounded-2xl border border-[#E8E1D8] space-y-2 text-xs text-[#18212B]">
              <span className="font-bold uppercase tracking-wider text-[#6F747A] text-[10px] block">
                Criteria Summary
              </span>
              <div className="grid grid-cols-2 gap-2 text-stone-600">
                <div>Occasion: <strong>{occasion}</strong></div>
                <div>Size: <strong>{size} (Bust {measurements.bust}")</strong></div>
                <div>Aesthetic: <strong>{styleMood}</strong></div>
                <div>Budget: <strong>Up to ₹{maxBudget}</strong></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(5)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleRunMatch}
              disabled={isMatching}
              className="px-7 py-3 bg-[#6D4AFF] hover:bg-[#5837db] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition"
            >
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Matching Outfits...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#C89228]" />
                  <span>Run AI Style Match</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 8: Match Results Showcase */}
      {step === 8 && matchResults && (
        <div className="space-y-8 animate-fade-in">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 pb-6 border-b border-[#E8E1D8]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#197B5B]/10 text-[#197B5B] text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{matchResults.length} Outfits Matched for {occasion}</span>
              </div>
              <h2 className="font-serif-couture text-3xl font-bold text-[#18212B]">
                Curated Recommendations in {selectedCity}
              </h2>
              <p className="text-xs text-[#6F747A] mt-1">
                Filtered for Size {size}, {styleMood} mood, and budget under ₹{maxBudget.toLocaleString('en-IN')}.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-[#781F37] bg-white border border-[#E8E1D8] rounded-xl hover:bg-stone-50 cursor-pointer"
            >
              Adjust Preferences
            </button>
          </div>

          {/* 96% Best Match Hero Card (Requirement Step 4) */}
          {bestMatch && (
            <div className="bg-gradient-to-br from-[#FFF9F1] via-white to-[#FFF9F1] rounded-3xl p-6 sm:p-8 border-2 border-[#C89228]/60 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#18212B] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#C89228]" />
                <span>{bestMatch.matchScorePercent}% Best Match</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Image */}
                <div className="md:col-span-4 aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                  <img
                    src={bestMatch.product.images[0]}
                    alt={bestMatch.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
                      Top Algorithmic Pick for Your Farewell
                    </span>
                    <h3 className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#18212B] mt-1">
                      {bestMatch.product.title}
                    </h3>
                    <p className="text-xs text-[#6F747A] mt-1">
                      {bestMatch.product.brand} · {bestMatch.product.fabric}
                    </p>
                  </div>

                  {/* Why it Matches Bullets */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6F747A] block">
                      Why This Matches Ananya’s Look:
                    </span>
                    <div className="space-y-1.5">
                      {bestMatch.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[#18212B]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#197B5B] flex-shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing, Deposit & Distance */}
                  <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-[#6F747A] block">3-Day Rental</span>
                      <span className="font-serif-couture text-xl font-bold text-[#18212B]">
                        ₹{bestMatch.product.rentalPrice3Days.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="border-l border-stone-200 pl-3">
                      <span className="text-[#6F747A] block">Refundable Deposit</span>
                      <span className="font-bold text-[#197B5B] text-base">
                        ₹{bestMatch.product.refundableDeposit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="border-l border-stone-200 pl-3">
                      <span className="text-[#6F747A] block">Proximity</span>
                      <span className="font-bold text-stone-800 text-sm">
                        {bestMatch.distanceKm} km · {bestMatch.product.locality}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => onSelectProduct(bestMatch.product)}
                      className="px-6 py-3 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer"
                    >
                      Reserve Best Match
                    </button>
                    <button
                      onClick={() => setSelectedPassportProduct(bestMatch.product)}
                      className="px-4 py-3 bg-white hover:bg-stone-50 border border-[#E8E1D8] text-[#18212B] rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Inspect Passport ({bestMatch.product.usageCount} wears)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Matching Outfits */}
          <div>
            <h3 className="text-lg font-bold text-[#18212B] mb-4">
              More Recommended Outfits Nearby
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchResults.slice(1).map((match) => (
                <ProductCard
                  key={match.product.id}
                  product={match.product}
                  matchScore={match.matchScorePercent}
                  fitConfidence={match.fitConfidence}
                  matchReason={match.reasons[0]}
                  onSelect={onSelectProduct}
                  onOpenPassport={(p) => setSelectedPassportProduct(p)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
