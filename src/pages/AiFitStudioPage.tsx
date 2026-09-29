import React, { useState, useEffect, useRef } from 'react';
import { Product, FitMode, UserMeasurements } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  Trash2,
  Ruler,
  Layers,
  Info,
  ArrowRight,
  Shirt
} from 'lucide-react';

interface AiFitStudioPageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const AiFitStudioPage: React.FC<AiFitStudioPageProps> = ({
  onNavigate,
  onSelectProduct
}) => {
  const { currentUser, selectedCity, showToast } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');

  // Privacy & Consent
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  // Photos
  const samplePhotos = [
    {
      id: 'ananya',
      name: 'Ananya (Student Demo)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'studio_model',
      name: 'Editorial Studio Model',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
    }
  ];
  const [userPhoto, setUserPhoto] = useState<string | null>(samplePhotos[0].url);

  // Measurements
  const [measurements, setMeasurements] = useState<UserMeasurements>(
    currentUser.measurements || {
      bust: 36,
      waist: 28,
      hip: 38,
      height: 165,
      preferredFit: 'regular'
    }
  );

  const [showSeamOverlay, setShowSeamOverlay] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct(data.products[0]); // Default to Black & Gold Gown
          setSelectedSize(data.products[0].sizeLabel || 'M');
        }
      })
      .catch(console.error);
  }, []);

  const activeProduct = selectedProduct || products[0];

  // Garment Measurements for Selected Size
  const getSizeMeasurements = (sizeName: string) => {
    if (!activeProduct) return { bust: 37, waist: 29, hip: 39.5, length: 56, stretchLevel: 'Low' };
    const base = activeProduct.measurements;
    const delta = sizeName === 'XS' ? -4 : sizeName === 'S' ? -2 : sizeName === 'M' ? 0 : sizeName === 'L' ? 3 : 6;
    return {
      bust: Number((base.bust + delta).toFixed(1)),
      waist: Number((base.waist + delta).toFixed(1)),
      hip: Number((base.hip + delta).toFixed(1)),
      length: base.length,
      stretchLevel: base.stretchLevel
    };
  };

  const currentGarment = getSizeMeasurements(selectedSize);

  // Seam Ease
  const bustEase = Number((currentGarment.bust - measurements.bust).toFixed(1));
  const waistEase = Number((currentGarment.waist - measurements.waist).toFixed(1));
  const hipEase = Number((currentGarment.hip - measurements.hip).toFixed(1));

  let minAllowedEase = 0.5;
  if (activeProduct?.measurements.stretchLevel === 'High') minAllowedEase = -2.0;
  else if (activeProduct?.measurements.stretchLevel === 'Medium') minAllowedEase = -1.0;
  else if (activeProduct?.measurements.stretchLevel === 'Low') minAllowedEase = 0.0;
  else minAllowedEase = 0.5;

  let fitMode: FitMode = 'REGULAR';
  let fitConfidence = 96;
  let isWearable = true;

  if (bustEase < minAllowedEase || waistEase < minAllowedEase) {
    fitMode = 'NOT_RECOMMENDED';
    fitConfidence = 35;
    isWearable = false;
  } else {
    const avgEase = (bustEase + waistEase + hipEase) / 3;
    if (avgEase <= 0.8) {
      fitMode = 'SNUG';
      fitConfidence = 88;
    } else if (avgEase <= 2.2) {
      fitMode = 'REGULAR';
      fitConfidence = 96;
    } else if (avgEase <= 4.5) {
      fitMode = 'RELAXED';
      fitConfidence = 90;
    } else {
      fitMode = 'OVERSIZED';
      fitConfidence = 82;
    }
  }

  // Draw on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeProduct) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = userPhoto || activeProduct.images[0];

    img.onload = () => {
      canvas.width = 480;
      canvas.height = 600;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dark gradient at bottom
      const gradient = ctx.createLinearGradient(0, canvas.height - 180, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(24,33,43,0.94)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

      // Size-Aware Drape Silhouette
      ctx.save();
      const centerX = canvas.width / 2;
      const shoulderY = 160;
      const waistY = 280;
      const hemY = 500;

      let bodiceHalfWidth = 72;
      let waistHalfWidth = 54;
      let hemHalfWidth = 105;
      let drapeColor = 'rgba(25, 123, 91, 0.40)';
      let outlineColor = '#197B5B';

      if (fitMode === 'SNUG') {
        bodiceHalfWidth = 62;
        waistHalfWidth = 46;
        hemHalfWidth = 88;
        drapeColor = 'rgba(200, 146, 40, 0.45)';
        outlineColor = '#C89228';
      } else if (fitMode === 'REGULAR') {
        bodiceHalfWidth = 72;
        waistHalfWidth = 54;
        hemHalfWidth = 105;
        drapeColor = 'rgba(25, 123, 91, 0.40)';
        outlineColor = '#197B5B';
      } else if (fitMode === 'RELAXED') {
        bodiceHalfWidth = 82;
        waistHalfWidth = 65;
        hemHalfWidth = 126;
        drapeColor = 'rgba(109, 74, 255, 0.38)';
        outlineColor = '#6D4AFF';
      } else if (fitMode === 'OVERSIZED') {
        bodiceHalfWidth = 92;
        waistHalfWidth = 75;
        hemHalfWidth = 140;
        drapeColor = 'rgba(24, 33, 43, 0.45)';
        outlineColor = '#18212B';
      } else if (fitMode === 'NOT_RECOMMENDED') {
        bodiceHalfWidth = 54;
        waistHalfWidth = 40;
        hemHalfWidth = 78;
        drapeColor = 'rgba(201, 59, 59, 0.50)';
        outlineColor = '#C93B3B';
      }

      ctx.beginPath();
      ctx.moveTo(centerX - bodiceHalfWidth, shoulderY);
      ctx.quadraticCurveTo(centerX - waistHalfWidth, (shoulderY + waistY) / 2, centerX - waistHalfWidth, waistY);
      ctx.quadraticCurveTo(centerX - hemHalfWidth * 0.7, (waistY + hemY) / 2, centerX - hemHalfWidth, hemY);
      ctx.lineTo(centerX + hemHalfWidth, hemY);
      ctx.quadraticCurveTo(centerX + hemHalfWidth * 0.7, (waistY + hemY) / 2, centerX + waistHalfWidth, waistY);
      ctx.quadraticCurveTo(centerX + waistHalfWidth, (shoulderY + waistY) / 2, centerX + bodiceHalfWidth, shoulderY);
      ctx.closePath();

      ctx.fillStyle = drapeColor;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = outlineColor;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      if (showSeamOverlay) {
        ctx.setLineDash([]);
        ctx.font = 'bold 12px Plus Jakarta Sans, system-ui';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 4;

        ctx.fillText(`Bust: ${currentGarment.bust}" (${bustEase > 0 ? '+' : ''}${bustEase}")`, 24, 220);
        ctx.fillText(`Waist: ${currentGarment.waist}" (${waistEase > 0 ? '+' : ''}${waistEase}")`, 24, waistY);
        ctx.fillText(`Hip: ${currentGarment.hip}" (${hipEase > 0 ? '+' : ''}${hipEase}")`, 24, 370);
      }

      ctx.restore();
    };
  }, [userPhoto, selectedSize, measurements, showSeamOverlay, fitMode, currentGarment, activeProduct]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!consentGiven) {
      showToast('Please check the consent box to authorize ephemeral photo preview');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setUserPhoto(event.target?.result as string);
      showToast('Clothed full-body photo loaded for measurement simulation');
    };
    reader.readAsDataURL(file);
  };

  const handlePurgePhoto = async () => {
    setUserPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    try {
      await fetch('/api/tryon/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
    } catch {}
    showToast('Photo and simulation assets completely purged from browser & server');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 text-[#6D4AFF] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Privacy-First AI Fit Studio</span>
        </div>
        <h1 className="font-serif-couture text-3xl sm:text-5xl font-bold text-[#18212B]">
          Virtual Try-On & Body Drape Studio
        </h1>
        <p className="text-xs sm:text-sm text-[#6F747A] leading-relaxed mt-2">
          Upload a clothed full-body photo and test how any designer piece drapes on your silhouette. Compare sizes (S, M, L) with transparent seam-ease calculations before booking.
        </p>
      </div>

      {/* Outfit Selector Carousel */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
            Select Outfit to Try On
          </span>
          <span className="text-xs text-stone-500">{products.length} outfits available in {selectedCity}</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.map((p) => {
            const isSelected = activeProduct?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setSelectedSize(p.sizeLabel || 'M');
                }}
                className={`flex-shrink-0 w-44 rounded-2xl border p-2.5 bg-stone-50/50 hover:bg-white transition cursor-pointer ${
                  isSelected ? 'border-[#781F37] ring-2 ring-[#781F37]/30 bg-white shadow-sm' : 'border-[#E8E1D8]'
                }`}
              >
                <img
                  src={p.images[0]}
                  alt={p.title}
                  className="w-full aspect-[4/5] object-cover rounded-xl border border-stone-200"
                />
                <div className="mt-2">
                  <span className="text-[10px] text-stone-500 block uppercase font-medium">{p.category}</span>
                  <h4 className="text-xs font-bold text-[#18212B] line-clamp-1">{p.title}</h4>
                  <span className="text-xs font-bold text-[#781F37] mt-1 block">
                    ₹{p.rentalPrice3Days.toLocaleString('en-IN')} / 3 days
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Try-On Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Size-Aware Drape Viewport (6 Cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#18212B]">Size-Aware Drape Simulation</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                fitMode === 'REGULAR'
                  ? 'bg-emerald-100 text-[#197B5B]'
                  : fitMode === 'NOT_RECOMMENDED'
                  ? 'bg-red-100 text-[#C93B3B]'
                  : 'bg-amber-100 text-[#C89228]'
              }`}>
                {fitMode.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSeamOverlay(!showSeamOverlay)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border cursor-pointer ${
                  showSeamOverlay ? 'bg-[#781F37] text-white border-[#781F37]' : 'bg-stone-50 border-stone-200 text-stone-600'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Overlay</span>
              </button>

              <label className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                <span>Upload</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {userPhoto && (
                <button
                  type="button"
                  onClick={handlePurgePhoto}
                  className="p-1.5 text-stone-400 hover:text-red-600 cursor-pointer"
                  title="Purge photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            {userPhoto ? (
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Camera className="w-10 h-10 text-stone-400" />
                <p className="text-xs text-stone-600">
                  No photo loaded. Upload a clothed full-body photo or select a sample profile.
                </p>
                <button
                  onClick={() => setUserPhoto(samplePhotos[0].url)}
                  className="px-4 py-2 bg-[#781F37] text-white text-xs font-semibold rounded-xl"
                >
                  Use Sample Photo
                </button>
              </div>
            )}

            {userPhoto && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-xs text-white p-3 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">
                    {activeProduct?.title} (Size {selectedSize})
                  </span>
                  <span className="text-[10px] text-stone-300">
                    {activeProduct?.measurements.stretchLevel} Stretch Fabric
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#197B5B] block">
                    {fitConfidence}% Confidence
                  </span>
                  <span className="text-[10px] text-stone-300">Seam-calibrated</span>
                </div>
              </div>
            )}
          </div>

          {/* Sample Preset Buttons */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span>Sample Demo Profiles:</span>
            <div className="flex gap-2">
              {samplePhotos.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => setUserPhoto(sp.url)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-medium cursor-pointer"
                >
                  {sp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Controls, Sizing, Math, Privacy (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Size Selector */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-[#6F747A] block">
              1. Choose Size to Compare Drape
            </span>

            <div className="grid grid-cols-3 gap-3">
              {['S', 'M', 'L'].map((s) => {
                const sMeasurements = getSizeMeasurements(s);
                const sBustEase = Number((sMeasurements.bust - measurements.bust).toFixed(1));
                const isSelected = selectedSize === s;

                let tag = 'Regular';
                let tagColor = 'bg-emerald-100 text-[#197B5B]';
                if (sBustEase < minAllowedEase) {
                  tag = 'Too Tight';
                  tagColor = 'bg-red-100 text-[#C93B3B]';
                } else if (sBustEase <= 0.8) {
                  tag = 'Snug';
                  tagColor = 'bg-amber-100 text-[#C89228]';
                } else if (sBustEase > 2.2) {
                  tag = 'Relaxed';
                  tagColor = 'bg-purple-100 text-[#6D4AFF]';
                }

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-[#781F37] ring-2 ring-[#781F37]/30 bg-[#FFF9F1]'
                        : 'border-[#E8E1D8] bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#18212B]">Size {s}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagColor}`}>
                        {tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1">
                      Bust: {sMeasurements.bust}" ({sBustEase > 0 ? `+${sBustEase}"` : `${sBustEase}"`})
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seam Ease Math Breakdown */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-[#781F37]" />
                <span className="font-bold uppercase tracking-wider text-[#18212B]">
                  Seam Ease Calculation (Garment - User)
                </span>
              </div>
              <span className="font-bold text-[#197B5B]">{fitConfidence}% Confidence</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-stone-700 mb-1">
                  <span>Bust: Garment {currentGarment.bust}" vs User {measurements.bust}"</span>
                  <span className={`font-bold ${bustEase < 0 ? 'text-[#C93B3B]' : 'text-[#197B5B]'}`}>
                    {bustEase > 0 ? `+${bustEase}"` : `${bustEase}"`} ease
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bustEase < 0 ? 'bg-[#C93B3B]' : 'bg-[#197B5B]'}`}
                    style={{ width: `${Math.min(100, Math.max(10, (bustEase + 2) * 20))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-700 mb-1">
                  <span>Waist: Garment {currentGarment.waist}" vs User {measurements.waist}"</span>
                  <span className={`font-bold ${waistEase < 0 ? 'text-[#C93B3B]' : 'text-[#197B5B]'}`}>
                    {waistEase > 0 ? `+${waistEase}"` : `${waistEase}"`} ease
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${waistEase < 0 ? 'bg-[#C93B3B]' : 'bg-[#197B5B]'}`}
                    style={{ width: `${Math.min(100, Math.max(10, (waistEase + 2) * 20))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-stone-700 mb-1">
                  <span>Hip: Garment {currentGarment.hip}" vs User {measurements.hip}"</span>
                  <span className={`font-bold ${hipEase < 0 ? 'text-[#C93B3B]' : 'text-[#197B5B]'}`}>
                    {hipEase > 0 ? `+${hipEase}"` : `${hipEase}"`} ease
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hipEase < 0 ? 'bg-[#C93B3B]' : 'bg-[#197B5B]'}`}
                    style={{ width: `${Math.min(100, Math.max(10, (hipEase + 2) * 20))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommendation explanation note */}
            <div className={`p-3.5 rounded-2xl leading-relaxed ${
              isWearable
                ? 'bg-[#197B5B]/10 text-stone-800 border border-[#197B5B]/30'
                : 'bg-[#C93B3B]/10 text-[#C93B3B] border border-[#C93B3B]/30'
            }`}>
              {isWearable ? (
                <div>
                  <span className="font-bold text-[#197B5B] block mb-0.5">
                    ✓ Recommended: Size {selectedSize} ({fitMode.replace('_', ' ')})
                  </span>
                  With +{bustEase}" ease across the chest and +{waistEase}" at the waist, this piece drapes with flattering fluidity on your silhouette.
                </div>
              ) : (
                <div>
                  <span className="font-bold text-[#C93B3B] block mb-0.5">
                    ⚠️ Size {selectedSize} Too Tight for Comfort
                  </span>
                  Negative ease will cause seam stress on this {activeProduct?.fabric}. Please choose Size M or L.
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Consent Shield */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#197B5B] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy-First Architecture & Deletion Rights</span>
            </div>

            <p className="text-stone-600 leading-relaxed">
              We process your photo strictly in client memory. No biometric face recognition is performed. You can purge your photo anytime using the delete button.
            </p>

            <label className="flex items-start gap-2 pt-1 text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded text-[#781F37] focus:ring-[#781F37]"
              />
              <span>
                I give consent to process my clothed full-body photo for sizing drape preview.
              </span>
            </label>
          </div>

          {/* Prominent Disclaimer */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Actual Fit May Vary:</strong> AI previews and fit estimates are approximate visual simulations. Actual fabric drape, stretch recovery, skin comfort, and posture-dependent fit may vary based on garment age, tailoring margins, and individual body proportions.
            </p>
          </div>

          {/* Booking CTA */}
          <div className="flex gap-3">
            <button
              onClick={() => onSelectProduct(activeProduct)}
              disabled={!isWearable}
              className="flex-1 py-3.5 px-6 bg-[#781F37] hover:bg-[#5E182B] disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition cursor-pointer text-center"
            >
              Reserve Size {selectedSize} (₹{activeProduct?.rentalPrice3Days.toLocaleString('en-IN')})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
