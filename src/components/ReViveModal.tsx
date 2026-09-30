import React, { useState, useEffect } from 'react';
import { Product, ReVivePartner, ReViveRequest, ProductCondition } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw,
  HeartHandshake,
  Recycle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  FileText,
  DollarSign,
  QrCode,
  Package,
  Layers,
  Scissors,
  Check,
  Award
} from 'lucide-react';

interface ReViveModalProps {
  product: Product;
  initialRoute?: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE';
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReViveModal: React.FC<ReViveModalProps> = ({
  product,
  initialRoute,
  onClose,
  onSuccess
}) => {
  const { currentUser, showToast } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<ReVivePartner[]>([]);

  // Step 1: Item Review State
  const [isClean, setIsClean] = useState(true);
  const [isWearable, setIsWearable] = useState(
    product.condition !== 'Damaged' && product.condition !== 'Major damage'
  );
  const [needsMinorRepair, setNeedsMinorRepair] = useState(
    product.condition === 'Fair' || product.condition === 'Minor damage'
  );
  const [isDamagedBeyondRental, setIsDamagedBeyondRental] = useState(
    product.condition === 'Damaged' || product.condition === 'Major damage'
  );
  const [confirmedFabric, setConfirmedFabric] = useState(product.fabric);
  const [accessoriesIncluded, setAccessoriesIncluded] = useState(false);
  const [sellerPriority, setSellerPriority] = useState<
    'MAX_REUSE' | 'DONATION' | 'EARN_PAYOUT' | 'FAST_PICKUP' | 'CLOSEST' | 'AI_RECOMMEND'
  >('AI_RECOMMEND');

  // Condition Evidence Photos
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([
    product.images[0] || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    product.images[1] || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showAddPhoto, setShowAddPhoto] = useState(false);

  // Step 2: Route Selection & Recommendation
  const [selectedRoute, setSelectedRoute] = useState<
    'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE'
  >(initialRoute || 'DONATE');

  // Calculate recommended route based on rules
  const getRecommendedRoute = (): {
    route: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE';
    reason: string;
  } => {
    if (product.condition === 'Retired') {
      return {
        route: 'RETIRE',
        reason: 'Garment has concluded all circular usage cycles.'
      };
    }
    if (isDamagedBeyondRental) {
      if (
        product.category === 'Lehenga' ||
        product.category === 'Sherwani' ||
        product.fabric.toLowerCase().includes('zari') ||
        product.fabric.toLowerCase().includes('brocade')
      ) {
        return {
          route: 'UPCYCLE',
          reason: 'Structural tear prevents rental, but heavy embroidery and zari borders are prime for artisanal potli clutches and cushion upcycling.'
        };
      }
      return {
        route: 'RECYCLE',
        reason: 'Fabric has sustained structural damage. Prime for mechanical fiber reclamation and spinning at ₹25-₹40/kg.'
      };
    }
    if (needsMinorRepair && product.repairsCount < 3) {
      return {
        route: 'REPAIR',
        reason: 'Minor mendable wear detected. Repairing and relisting will preserve 100% of rental earning capacity.'
      };
    }
    if (isWearable && isClean) {
      return {
        route: 'DONATE',
        reason: 'Dignified corporate/festive wear with 20+ successful wears. High demand at local college closets and verified trusts.'
      };
    }
    return {
      route: 'RECYCLE',
      reason: 'Circular end-of-life recycling recommended.'
    };
  };

  const recommendation = getRecommendedRoute();

  useEffect(() => {
    if (!initialRoute) {
      setSelectedRoute(recommendation.route);
    }
  }, [isDamagedBeyondRental, needsMinorRepair, isWearable, isClean]);

  // Fetch partners
  useEffect(() => {
    fetch('/api/revive/partners')
      .then(res => res.json())
      .then(data => {
        if (data.partners) setPartners(data.partners);
      })
      .catch(console.error);
  }, []);

  // Step 3: Partner Selection
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [filteredPartners, setFilteredPartners] = useState<ReVivePartner[]>([]);

  useEffect(() => {
    let filtered = partners;
    if (selectedRoute === 'DONATE') {
      filtered = partners.filter(
        p =>
          p.partnerType === 'DONATION_NGO' ||
          p.partnerType === 'COMMUNITY_WARDROBE' ||
          p.partnerType === 'COLLEGE_CLOSET' ||
          p.partnerType === 'DISASTER_RELIEF'
      );
    } else if (selectedRoute === 'RECYCLE') {
      filtered = partners.filter(p => p.partnerType === 'RECYCLING_HUB');
    } else if (selectedRoute === 'UPCYCLE') {
      filtered = partners.filter(p => p.partnerType === 'UPCYCLE_STUDIO');
    }
    setFilteredPartners(filtered);
    if (filtered.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(filtered[0].id);
    }
  }, [selectedRoute, partners]);

  // Step 4: Schedule Handover State
  const [handoverMethod, setHandoverMethod] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
  const [pickupDate, setPickupDate] = useState('Tomorrow, 10:00 AM - 1:00 PM');
  const [pickupAddress, setPickupAddress] = useState(
    `${product.locality}, ${product.city} (Registered Wardrobe Location)`
  );
  const [handoverNotes, setHandoverNotes] = useState('Freshly sanitized in sealed biodegradable garment bag.');

  // Generated Request State
  const [activeRequest, setActiveRequest] = useState<ReViveRequest | null>(null);

  // Step 5: Outcome Simulation State
  const [outcomeWeight, setOutcomeWeight] = useState<number>(product.estimatedWeightKg || 1.2);
  const [outcomePayoutRate, setOutcomePayoutRate] = useState<number>(30);
  const [receiptNumber, setReceiptNumber] = useState(`RWH-REC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [certificateNumber, setCertificateNumber] = useState(`CERT-ECO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [relistCondition, setRelistCondition] = useState<ProductCondition>('Good');
  const [relistPrice, setRelistPrice] = useState<number>(product.rentalPrice3Days);

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);

  // Handlers
  const handleProceedToNextLife = () => {
    setCurrentStep(2);
  };

  const handleProceedToPartner = () => {
    if (selectedRoute === 'RETIRE' || selectedRoute === 'REPAIR') {
      // Skip partner if repair atelier or retire
      setCurrentStep(4);
    } else {
      setCurrentStep(3);
    }
  };

  const handleProceedToSchedule = () => {
    setCurrentStep(4);
  };

  const handleCreateRequest = async () => {
    setLoading(true);
    try {
      const estimatedPayout = Math.round((product.estimatedWeightKg || 1.0) * 30);
      const res = await fetch('/api/revive/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          productId: product.id,
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          route: selectedRoute,
          partnerId: selectedPartner?.id,
          partnerName: selectedPartner?.name,
          partnerType: selectedPartner?.partnerType,
          handoverMethod,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          weightKg: product.estimatedWeightKg || 1.0,
          recyclerPayoutEstimate: selectedRoute === 'RECYCLE' ? estimatedPayout : undefined,
          repairCostEstimate: selectedRoute === 'REPAIR' ? 250 : undefined,
          condition: product.condition,
          notes: handoverNotes,
          evidencePhotos
        })
      });

      const data = await res.json();
      if (data.request) {
        setActiveRequest(data.request);
        setCurrentStep(5);
        showToast(`ReVive ${selectedRoute.toLowerCase()} handover pass generated!`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error creating ReVive request');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmFinalOutcome = async () => {
    if (!activeRequest) return;
    setLoading(true);
    try {
      const calculatedPayout = selectedRoute === 'RECYCLE' ? Math.round(outcomeWeight * outcomePayoutRate) : undefined;
      const res = await fetch(`/api/revive/requests/${activeRequest.id}/confirm-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalWeightKg: outcomeWeight,
          finalPayout: calculatedPayout,
          receiptId: receiptNumber,
          certificateId: certificateNumber,
          relistCondition,
          relistPrice,
          notes: 'Completed in full compliance with ReWear Circular Passport standard.'
        })
      });

      if (res.ok) {
        showToast(`ReVive completed! Product digital passport updated.`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-3xl max-h-[94vh] rounded-3xl shadow-2xl border border-[#E8E1D8] flex flex-col overflow-hidden my-auto">
        {/* Header with Circular Ribbon */}
        <div className="bg-gradient-to-r from-[#18212B] to-[#2B3542] text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-[#197B5B]/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#197B5B]/30 border border-[#197B5B]/50 text-[#197B5B] text-[11px] font-bold uppercase tracking-wider">
                <Recycle className="w-3.5 h-3.5 text-[#197B5B]" />
                ReVive Hub
              </span>
              <span className="text-[11px] text-stone-300 font-medium">
                Step {currentStep} of 5
              </span>
            </div>
            <h2 className="font-serif-couture text-2xl font-bold">
              Give Every Garment a Second Life
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Repair, donate to verified trusts, upcycle, or sell to textile recyclers.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-3 bg-white border-b border-[#E8E1D8] flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Item Review' },
            { num: 2, label: 'Best Next Life' },
            { num: 3, label: 'Choose Partner' },
            { num: 4, label: 'Schedule Handover' },
            { num: 5, label: 'Confirm Outcome' }
          ].map(step => (
            <div
              key={step.num}
              className={`flex items-center gap-2 ${
                currentStep === step.num
                  ? 'text-[#781F37] font-bold'
                  : currentStep > step.num
                  ? 'text-[#197B5B] font-semibold'
                  : 'text-stone-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === step.num
                    ? 'bg-[#781F37] text-white'
                    : currentStep > step.num
                    ? 'bg-[#197B5B] text-white'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span className="hidden md:inline">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: ITEM REVIEW */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Product Identity Summary Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-24 h-28 object-cover rounded-xl border border-stone-200"
                />
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-[#6F747A] uppercase text-[10px] font-bold">
                    <span>{product.category}</span>
                    <span>·</span>
                    <span className="font-mono text-[#18212B]">{product.productCode}</span>
                    <span>·</span>
                    <span className="text-[#197B5B]">{product.condition} Condition</span>
                  </div>
                  <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                    {product.title}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-stone-600">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Usage Count</span>
                      <strong className="text-[#18212B]">{product.usageCount} wears ({product.usageDays || 42} days)</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Repairs Logged</span>
                      <strong className="text-[#18212B]">{product.repairsCount} repairs</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Fabric / Material</span>
                      <strong className="text-[#18212B]">{product.fabric}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Est. Weight</span>
                      <strong className="text-[#18212B]">~{product.estimatedWeightKg || 1.0} kg</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Condition Self-Check */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#18212B] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#197B5B]" />
                  Condition & Readiness Assessment
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isClean}
                      onChange={e => setIsClean(e.target.checked)}
                      className="accent-[#197B5B] w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold block">Is the product clean & sanitized?</span>
                      <span className="text-stone-400 text-[10px]">No active odor, washed and dry</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isWearable}
                      onChange={e => {
                        setIsWearable(e.target.checked);
                        if (e.target.checked) setIsDamagedBeyondRental(false);
                      }}
                      className="accent-[#197B5B] w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold block">Is it wearable today?</span>
                      <span className="text-stone-400 text-[10px]">Fit for another person without hazard</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={needsMinorRepair}
                      onChange={e => setNeedsMinorRepair(e.target.checked)}
                      className="accent-[#781F37] w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold block">Needs minor repair?</span>
                      <span className="text-stone-400 text-[10px]">Loose button, hem stitch, zipper adjustment</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDamagedBeyondRental}
                      onChange={e => {
                        setIsDamagedBeyondRental(e.target.checked);
                        if (e.target.checked) setIsWearable(false);
                      }}
                      className="accent-[#781F37] w-4 h-4"
                    />
                    <div>
                      <span className="font-semibold block">Damaged beyond rental/reuse?</span>
                      <span className="text-stone-400 text-[10px]">Severe dye stain, fabric rip, structural tear</span>
                    </div>
                  </label>
                </div>

                {/* Priority Selection */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1.5">
                    What is your primary goal for this garment?
                  </label>
                  <select
                    value={sellerPriority}
                    onChange={e => setSellerPriority(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#781F37] outline-hidden cursor-pointer"
                  >
                    <option value="AI_RECOMMEND">✨ Let ReWear Recommend Optimal Circular Next-Life</option>
                    <option value="MAX_REUSE">🔄 Maximise Reuse (Repair & Relist for rental)</option>
                    <option value="DONATION">🤝 Support Community Donation (NGOs & College Closets)</option>
                    <option value="EARN_PAYOUT">💰 Earn Recycling Payout (₹25-₹40 / kg)</option>
                    <option value="FAST_PICKUP">⚡ Fastest Available Doorstep Pickup</option>
                    <option value="CLOSEST">📍 Closest Verified Partner in Chennai</option>
                  </select>
                </div>
              </div>

              {/* Condition Evidence Photographs */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[#18212B] flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#781F37]" />
                    Condition Verification Evidence ({evidencePhotos.length} photos)
                  </h4>
                  <button
                    onClick={() => setShowAddPhoto(true)}
                    className="text-xs text-[#781F37] font-semibold hover:underline cursor-pointer"
                  >
                    + Add Condition Photo
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {evidencePhotos.map((url, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-stone-200 aspect-square group">
                      <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-[10px] text-white font-medium">Photo #{idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddPhoto && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL (e.g. photo of tear, hem, or dry clean tag)"
                      value={newPhotoUrl}
                      onChange={e => setNewPhotoUrl(e.target.value)}
                      className="flex-1 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-hidden"
                    />
                    <button
                      onClick={() => {
                        if (newPhotoUrl.trim()) {
                          setEvidencePhotos([...evidencePhotos, newPhotoUrl.trim()]);
                          setNewPhotoUrl('');
                          setShowAddPhoto(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#781F37] text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: BEST NEXT LIFE (RECOMMENDATIONS) */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Recommendation Banner */}
              <div className="bg-[#197B5B]/10 p-5 rounded-2xl border border-[#197B5B]/30 flex items-start gap-4">
                <div className="p-3 bg-[#197B5B] text-white rounded-xl shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-[#197B5B] tracking-wider">
                      ReWear Recommendation Engine
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#197B5B] text-white">
                      Recommended: {recommendation.route}
                    </span>
                  </div>
                  <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                    Transparent Circular Assessment
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {recommendation.reason}
                  </p>
                </div>
              </div>

              {/* Next Life Options Grid */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
                  Select Next Life Path (You can accept or override our recommendation):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Route 1: Repair & Relist */}
                  <div
                    onClick={() => setSelectedRoute('REPAIR')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      selectedRoute === 'REPAIR'
                        ? 'border-[#781F37] bg-[#781F37]/5 shadow-xs'
                        : 'border-[#E8E1D8] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-[#781F37]/10 text-[#781F37]">
                          <Scissors className="w-5 h-5" />
                        </span>
                        {recommendation.route === 'REPAIR' && (
                          <span className="text-[10px] font-bold uppercase text-[#197B5B] bg-[#197B5B]/10 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#18212B]">Repair & Relist</h4>
                      <p className="text-xs text-stone-500 mt-1">
                        Send to Master Darzi partner. Seam reinforcement, zip replacement, or invisible mending, then relist back to wardrobe.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#781F37] mt-3">
                      Est. Repair Cost: ~₹200–₹350 · Retain ₹{product.rentalPrice3Days} rental revenue
                    </span>
                  </div>

                  {/* Route 2: Donate to Verified Trust */}
                  <div
                    onClick={() => setSelectedRoute('DONATE')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      selectedRoute === 'DONATE'
                        ? 'border-[#197B5B] bg-[#197B5B]/5 shadow-xs'
                        : 'border-[#E8E1D8] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-[#197B5B]/10 text-[#197B5B]">
                          <HeartHandshake className="w-5 h-5" />
                        </span>
                        {recommendation.route === 'DONATE' && (
                          <span className="text-[10px] font-bold uppercase text-[#197B5B] bg-[#197B5B]/10 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#18212B]">Donate for Community Reuse</h4>
                      <p className="text-xs text-stone-500 mt-1">
                        Donate to Goonj, Sneha Trust, or Adyar Working Women's Hostel Wardrobe. Verified 80G tax receipt and student acknowledgment.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#197B5B] mt-3">
                      3 Verified Trusts Nearby · 100% Tax Deductible Receipt
                    </span>
                  </div>

                  {/* Route 3: Upcycle into Artisan Crafts */}
                  <div
                    onClick={() => setSelectedRoute('UPCYCLE')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      selectedRoute === 'UPCYCLE'
                        ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                        : 'border-[#E8E1D8] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                          <Layers className="w-5 h-5" />
                        </span>
                        {recommendation.route === 'UPCYCLE' && (
                          <span className="text-[10px] font-bold uppercase text-[#197B5B] bg-[#197B5B]/10 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#18212B]">Upcycle into Crafts</h4>
                      <p className="text-xs text-stone-500 mt-1">
                        Zari borders & brocades transformed into 4–6 handcrafted potli clutches and decorative cushions by artisan cooperatives.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-700 mt-3">
                      Zero-Waste Craft Atelier · Receive 2 Complimentary Potlis
                    </span>
                  </div>

                  {/* Route 4: Sell to Textile Recycler */}
                  <div
                    onClick={() => setSelectedRoute('RECYCLE')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      selectedRoute === 'RECYCLE'
                        ? 'border-[#C89228] bg-[#C89228]/10 shadow-xs'
                        : 'border-[#E8E1D8] bg-white hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                          <Recycle className="w-5 h-5" />
                        </span>
                        {recommendation.route === 'RECYCLE' && (
                          <span className="text-[10px] font-bold uppercase text-[#197B5B] bg-[#197B5B]/10 px-2 py-0.5 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-[#18212B]">Sell to Textile Recycler</h4>
                      <p className="text-xs text-stone-500 mt-1">
                        Sell damaged pieces to EcoTex Recovery Hub for closed-loop thermal insulation and yarn shredding. Verified weight payout.
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 mt-3">
                      Payout: ₹25–₹40 / kg · Est. Earnings: ₹{Math.round((product.estimatedWeightKg || 1.0) * 30)}
                    </span>
                  </div>
                </div>

                {/* Responsible Retirement Option */}
                <div
                  onClick={() => setSelectedRoute('RETIRE')}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer flex items-center justify-between ${
                    selectedRoute === 'RETIRE'
                      ? 'border-stone-800 bg-stone-100 font-semibold'
                      : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-stone-400" />
                    <span>Responsibly Retire & De-list Item from ReWear platform</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Garment kept for private use</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE PARTNER */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                    Select Verified Chennai Partner for {selectedRoute}
                  </h3>
                  <p className="text-xs text-stone-500">
                    All partners are background-checked and issue digital audit receipts.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#197B5B]">
                  {filteredPartners.length} Partners Available
                </span>
              </div>

              <div className="space-y-3">
                {filteredPartners.map(partner => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartnerId(partner.id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                      selectedPartnerId === partner.id
                        ? 'border-[#197B5B] bg-[#197B5B]/5 shadow-xs'
                        : 'border-[#E8E1D8] bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#18212B]">{partner.name}</h4>
                          {partner.verified && (
                            <span className="flex items-center gap-1 text-[10px] text-[#197B5B] bg-[#197B5B]/10 px-2 py-0.5 rounded-full font-bold">
                              <ShieldCheck className="w-3 h-3" /> Verified Partner
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-2">
                          {partner.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#C89228]" />
                            {partner.approxDistanceKm} km · {partner.locality}
                          </span>

                          <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-[#781F37]" />
                            {partner.pickupSupported && partner.dropoffSupported
                              ? 'Doorstep Pickup & Hub Dropoff'
                              : partner.pickupSupported
                              ? 'Doorstep Pickup Only'
                              : 'Dropoff Hub Only'}
                          </span>

                          {partner.ratePerKgRange && (
                            <span className="text-amber-700 font-bold">
                              Rate: ₹{partner.ratePerKgRange.min}–₹{partner.ratePerKgRange.max} / kg
                            </span>
                          )}
                        </div>

                        {partner.upcycleOffer && (
                          <div className="text-[11px] text-purple-700 bg-purple-50 p-2 rounded-lg mt-2 font-medium">
                            ✨ {partner.upcycleOffer}
                          </div>
                        )}
                      </div>

                      <div className="text-right flex flex-col items-end justify-between self-stretch">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedPartnerId === partner.id
                              ? 'border-[#197B5B] bg-[#197B5B] text-white'
                              : 'border-stone-300'
                          }`}
                        >
                          {selectedPartnerId === partner.id && <Check className="w-3.5 h-3.5" />}
                        </div>
                        {partner.receiptProvided && (
                          <span className="text-[10px] text-stone-400 mt-auto">Tax Receipt</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SCHEDULE HANDOVER */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-4">
                <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                  Schedule Handover & Logistics
                </h3>

                {/* Handover Method Toggle */}
                <div>
                  <label className="text-xs uppercase font-bold text-stone-500 block mb-2">
                    Handover Method
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setHandoverMethod('PICKUP')}
                      className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                        handoverMethod === 'PICKUP'
                          ? 'border-[#781F37] bg-[#781F37] text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>Partner Vehicle Pickup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHandoverMethod('DROPOFF')}
                      className={`p-3 rounded-xl border font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                        handoverMethod === 'DROPOFF'
                          ? 'border-[#781F37] bg-[#781F37] text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span>I Will Drop Off at Hub</span>
                    </button>
                  </div>
                </div>

                {/* Schedule Window */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Preferred Date & Slot
                    </label>
                    <select
                      value={pickupDate}
                      onChange={e => setPickupDate(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-hidden"
                    >
                      <option>Tomorrow, 10:00 AM - 1:00 PM</option>
                      <option>Tomorrow, 2:00 PM - 5:00 PM</option>
                      <option>In 2 Days, 10:00 AM - 1:00 PM</option>
                      <option>This Weekend, Morning Slot</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Handover Locality / Address
                    </label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={e => setPickupAddress(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs outline-hidden"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Care & Handover Notes
                  </label>
                  <textarea
                    rows={2}
                    value={handoverNotes}
                    onChange={e => setHandoverNotes(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-hidden"
                  />
                </div>
              </div>

              {/* Handover Summary Card */}
              <div className="bg-[#FFF9F1] p-4 rounded-2xl border border-[#C89228] text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#C89228] font-bold">
                  <QrCode className="w-4 h-4" />
                  <span>Secure Handover Pass Generation</span>
                </div>
                <p className="text-stone-600">
                  Clicking "Generate Handover Pass" will create a verifiable QR pass and 6-digit OTP for the partner agent. Your garment status will update immediately.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRM OUTCOME (HANDOVER PASS & VERIFICATION) */}
          {currentStep === 5 && activeRequest && (
            <div className="space-y-6 animate-fade-in">
              {/* Pass Card with QR and OTP */}
              <div className="bg-white p-6 rounded-3xl border-2 border-[#197B5B] shadow-md space-y-5">
                <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#197B5B] tracking-wider block">
                      Active ReVive Handover Pass
                    </span>
                    <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
                      {activeRequest.productTitle}
                    </h3>
                    <span className="text-xs font-mono text-stone-500">
                      Pass ID: {activeRequest.id} · Route: {activeRequest.route}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#197B5B] bg-[#197B5B]/10 px-2.5 py-1 rounded-full">
                      Ready for Verification
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                  {/* Visual QR Code Display */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center space-y-2">
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-stone-300 flex items-center justify-center shadow-xs">
                      <QrCode className="w-28 h-28 text-[#18212B]" />
                    </div>
                    <span className="text-[10px] font-mono text-stone-500 block">
                      {activeRequest.qrCode}
                    </span>
                    <span className="text-[11px] text-[#197B5B] font-bold">
                      Scan by Partner Agent
                    </span>
                  </div>

                  {/* OTP & Handover Summary */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">
                        Verification 6-Digit OTP
                      </span>
                      <span className="font-mono text-3xl font-extrabold text-[#781F37] tracking-widest">
                        {activeRequest.otp}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-stone-100 text-stone-600">
                      <div>
                        <strong>Assigned Partner:</strong> {activeRequest.partnerName || 'Verified Hub'}
                      </div>
                      <div>
                        <strong>Scheduled Window:</strong> {pickupDate}
                      </div>
                      <div>
                        <strong>Location:</strong> {pickupAddress}
                      </div>
                      <div>
                        <strong>Method:</strong> {handoverMethod === 'PICKUP' ? 'Doorstep Partner Pickup' : 'Seller Hub Drop-off'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Action Box to Complete Handover & Record Final Receipt */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C89228]" />
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[#18212B]">
                      Simulate Partner Verification & Final Outcome
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400">Demo Verification Flow</span>
                </div>

                {selectedRoute === 'RECYCLE' && (
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-stone-200">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">
                        Verified Scale Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={outcomeWeight}
                        onChange={e => setOutcomeWeight(parseFloat(e.target.value) || 1.0)}
                        className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">
                        Calculated Seller Payout
                      </label>
                      <span className="font-serif-couture text-lg font-bold text-[#197B5B] block">
                        ₹{Math.round(outcomeWeight * outcomePayoutRate)}
                      </span>
                    </div>
                  </div>
                )}

                {selectedRoute === 'DONATE' && (
                  <div className="text-xs bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#18212B]">80G Tax Deductible Receipt ID:</span>
                      <span className="font-mono font-bold text-[#197B5B]">{receiptNumber}</span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Garment accepted by verified NGO for student career wardrobe redistribution.
                    </p>
                  </div>
                )}

                {selectedRoute === 'UPCYCLE' && (
                  <div className="text-xs bg-white p-3 rounded-xl border border-stone-200 space-y-1">
                    <span className="font-semibold text-purple-700 block">
                      Artisan Craft Transformation Verified
                    </span>
                    <p className="text-[11px] text-stone-500">
                      6 handcrafted heirloom potlis queued for production by artisan women collective.
                    </p>
                  </div>
                )}

                {selectedRoute === 'REPAIR' && (
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-stone-200">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">
                        Condition After Repair
                      </label>
                      <select
                        value={relistCondition}
                        onChange={e => setRelistCondition(e.target.value as any)}
                        className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">
                        Relist 3-Day Rental Price (₹)
                      </label>
                      <input
                        type="number"
                        value={relistPrice}
                        onChange={e => setRelistPrice(parseInt(e.target.value, 10) || product.rentalPrice3Days)}
                        className="w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmFinalOutcome}
                  disabled={loading}
                  className="w-full py-3 bg-[#197B5B] hover:bg-[#146349] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm Partner Verification & Update Digital Passport
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E8E1D8] flex items-center justify-between">
          <div>
            {currentStep > 1 && currentStep < 5 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={handleProceedToNextLife}
                className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Discover Best Next Life</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleProceedToPartner}
                className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed with {selectedRoute}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={handleProceedToSchedule}
                className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Schedule Handover</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={handleCreateRequest}
                disabled={loading}
                className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Generate Handover Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Pass
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
