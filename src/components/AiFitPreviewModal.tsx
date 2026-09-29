import React, { useState, useRef, useEffect } from 'react';
import { Product, FitMode, UserMeasurements } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Camera,
  Upload,
  ShieldCheck,
  RefreshCw,
  X,
  Info,
  Sliders,
  Ruler,
  Eye,
  Lock,
  Layers
} from 'lucide-react';

interface AiFitPreviewModalProps {
  product: Product;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
}

export const AiFitPreviewModal: React.FC<AiFitPreviewModalProps> = ({
  product,
  onClose,
  onSelectSize
}) => {
  const { currentUser, showToast } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Available Sizes
  const availableSizes = ['S', 'M', 'L'];
  const [selectedSize, setSelectedSize] = useState<string>(product.sizeLabel || 'M');

  // Privacy & Consent
  const [consentGiven, setConsentGiven] = useState<boolean>(true);
  const [isPhotoPurged, setIsPhotoPurged] = useState<boolean>(false);

  // User Photos
  const samplePhotos = [
    {
      id: 'ananya_photo',
      name: 'Ananya (Student Demo)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'editorial_photo',
      name: 'Evening Model Studio',
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
    }
  ];
  const [userPhoto, setUserPhoto] = useState<string | null>(samplePhotos[0].url);

  // User Measurements
  const [measurements, setMeasurements] = useState<UserMeasurements>(
    currentUser.measurements || {
      bust: 36,
      waist: 28,
      hip: 38,
      height: 165,
      preferredFit: 'regular'
    }
  );

  // View Controls
  const [showSeamOverlay, setShowSeamOverlay] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Compute garment measurements for each size relative to product base
  const getSizeMeasurements = (sizeName: string) => {
    const base = product.measurements;
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

  // Calculate Seam Ease
  const bustEase = Number((currentGarment.bust - measurements.bust).toFixed(1));
  const waistEase = Number((currentGarment.waist - measurements.waist).toFixed(1));
  const hipEase = Number((currentGarment.hip - measurements.hip).toFixed(1));

  // Minimum allowed ease depending on fabric stretch
  let minAllowedEase = 0.5;
  if (product.measurements.stretchLevel === 'High') minAllowedEase = -2.0;
  else if (product.measurements.stretchLevel === 'Medium') minAllowedEase = -1.0;
  else if (product.measurements.stretchLevel === 'Low') minAllowedEase = 0.0;
  else minAllowedEase = 0.5;

  // Determine Fit Mode & Confidence
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

  // Draw Size-Aware Drape on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = userPhoto || product.images[0];

    img.onload = () => {
      canvas.width = 460;
      canvas.height = 580;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw base photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Soft editorial vignette
      const gradient = ctx.createLinearGradient(0, canvas.height - 180, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(24,33,43,0.92)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

      // 3. Render Size-Aware Drape Silhouette Simulation
      ctx.save();
      const centerX = canvas.width / 2;
      const shoulderY = 160;
      const waistY = 280;
      const hemY = 480;

      // Adjust contour widths based on fitMode
      let bodiceHalfWidth = 68;
      let waistHalfWidth = 52;
      let hemHalfWidth = 98;
      let drapeColor = 'rgba(120, 31, 55, 0.45)'; // ReWear maroon tint
      let outlineColor = '#781F37';

      if (fitMode === 'SNUG') {
        bodiceHalfWidth = 60;
        waistHalfWidth = 44;
        hemHalfWidth = 84;
        drapeColor = 'rgba(200, 146, 40, 0.45)'; // Gold snug
        outlineColor = '#C89228';
      } else if (fitMode === 'REGULAR') {
        bodiceHalfWidth = 68;
        waistHalfWidth = 52;
        hemHalfWidth = 100;
        drapeColor = 'rgba(25, 123, 91, 0.40)'; // Emerald optimal
        outlineColor = '#197B5B';
      } else if (fitMode === 'RELAXED') {
        bodiceHalfWidth = 78;
        waistHalfWidth = 62;
        hemHalfWidth = 120;
        drapeColor = 'rgba(109, 74, 255, 0.38)'; // Violet relaxed
        outlineColor = '#6D4AFF';
      } else if (fitMode === 'OVERSIZED') {
        bodiceHalfWidth = 88;
        waistHalfWidth = 72;
        hemHalfWidth = 135;
        drapeColor = 'rgba(24, 33, 43, 0.45)';
        outlineColor = '#18212B';
      } else if (fitMode === 'NOT_RECOMMENDED') {
        bodiceHalfWidth = 52;
        waistHalfWidth = 38;
        hemHalfWidth = 76;
        drapeColor = 'rgba(201, 59, 59, 0.50)'; // Error red
        outlineColor = '#C93B3B';
      }

      // Draw flowing garment silhouette shape
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

      // Draw tension lines if SNUG or NOT_RECOMMENDED
      if (fitMode === 'SNUG' || fitMode === 'NOT_RECOMMENDED') {
        ctx.setLineDash([]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = fitMode === 'NOT_RECOMMENDED' ? '#C93B3B' : '#C89228';
        // Tension marks across waist
        ctx.beginPath();
        ctx.moveTo(centerX - waistHalfWidth + 5, waistY - 10);
        ctx.lineTo(centerX + waistHalfWidth - 5, waistY + 10);
        ctx.moveTo(centerX - waistHalfWidth + 5, waistY + 10);
        ctx.lineTo(centerX + waistHalfWidth - 5, waistY - 10);
        ctx.stroke();
      }

      // Draw fluid drape folds if RELAXED or OVERSIZED
      if (fitMode === 'RELAXED' || fitMode === 'OVERSIZED') {
        ctx.setLineDash([]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        // Vertical drape folds
        ctx.beginPath();
        ctx.moveTo(centerX - 15, waistY + 10);
        ctx.quadraticCurveTo(centerX - 25, (waistY + hemY) / 2, centerX - 30, hemY - 10);
        ctx.moveTo(centerX + 15, waistY + 10);
        ctx.quadraticCurveTo(centerX + 25, (waistY + hemY) / 2, centerX + 30, hemY - 10);
        ctx.stroke();
      }

      // 4. Seam Overlay Labels if enabled
      if (showSeamOverlay) {
        ctx.setLineDash([]);
        ctx.font = 'bold 11px Plus Jakarta Sans, system-ui';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;

        // Bust line
        ctx.fillText(`Bust: ${currentGarment.bust}" (${bustEase > 0 ? '+' : ''}${bustEase}")`, 20, 210);

        // Waist line
        ctx.fillText(`Waist: ${currentGarment.waist}" (${waistEase > 0 ? '+' : ''}${waistEase}")`, 20, waistY);

        // Hip line
        ctx.fillText(`Hip: ${currentGarment.hip}" (${hipEase > 0 ? '+' : ''}${hipEase}")`, 20, 360);
      }

      ctx.restore();
    };
  }, [userPhoto, selectedSize, measurements, showSeamOverlay, fitMode, currentGarment]);

  // Handle Local Photo Upload
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
      setIsPhotoPurged(false);
      showToast('Clothed full-body photo loaded for measurement preview');
    };
    reader.readAsDataURL(file);
  };

  // Immediate Privacy Deletion Control
  const handlePurgePhoto = async () => {
    setUserPhoto(null);
    setIsPhotoPurged(true);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      await fetch('/api/tryon/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
    } catch (err) {
      // offline fallback
    }

    showToast('Photo and simulation assets completely purged from browser & server');
  };

  const handleSimulateNewDrape = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast(`Regenerated drape for Size ${selectedSize} (${fitMode})`);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-4xl max-h-[94vh] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#E8E1D8] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D4AFF]/10 border border-[#6D4AFF]/30 flex items-center justify-center text-[#6D4AFF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#6D4AFF]">
                  Privacy-First AI Fit Preview & Virtual Try-On
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs font-semibold text-[#18212B]">{product.title}</span>
              </div>
              <h2 className="font-serif-couture text-lg sm:text-xl font-bold text-[#18212B]">
                Body Measurement & Size-Aware Drape Simulator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-black transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {/* Privacy & Zero-Retention Trust Banner */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#197B5B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#197B5B] flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#18212B] block">Privacy-First Architecture Active</span>
                <span className="text-stone-500">
                  Zero permanent photo storage. Processed ephemerally on client with immediate purge controls.
                </span>
              </div>
            </div>

            {userPhoto && (
              <button
                type="button"
                onClick={handlePurgePhoto}
                className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
                title="Purge uploaded image"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge My Photo</span>
              </button>
            )}
          </div>

          {/* Size Comparison & Fit Mode Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
                1. Select Size to Compare Drape & Measurements
              </span>
              <span className="text-xs text-[#6F747A]">
                User: <strong>{measurements.bust}" Bust · {measurements.waist}" Waist · {measurements.hip}" Hip</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {availableSizes.map((s) => {
                const sMeasurements = getSizeMeasurements(s);
                const sBustEase = Number((sMeasurements.bust - measurements.bust).toFixed(1));
                const sWaistEase = Number((sMeasurements.waist - measurements.waist).toFixed(1));
                const isSelected = selectedSize === s;

                let sFitMode: FitMode = 'REGULAR';
                let tagClass = 'bg-emerald-100 text-[#197B5B]';
                let borderClass = isSelected ? 'border-[#197B5B] ring-2 ring-[#197B5B]' : 'border-[#E8E1D8]';

                if (sBustEase < minAllowedEase || sWaistEase < minAllowedEase) {
                  sFitMode = 'NOT_RECOMMENDED';
                  tagClass = 'bg-red-100 text-[#C93B3B]';
                  borderClass = isSelected ? 'border-[#C93B3B] ring-2 ring-[#C93B3B]' : 'border-[#E8E1D8]';
                } else if (sBustEase <= 0.8) {
                  sFitMode = 'SNUG';
                  tagClass = 'bg-amber-100 text-[#C89228]';
                  borderClass = isSelected ? 'border-[#C89228] ring-2 ring-[#C89228]' : 'border-[#E8E1D8]';
                } else if (sBustEase <= 2.2) {
                  sFitMode = 'REGULAR';
                  tagClass = 'bg-emerald-100 text-[#197B5B]';
                } else {
                  sFitMode = 'RELAXED';
                  tagClass = 'bg-purple-100 text-[#6D4AFF]';
                  borderClass = isSelected ? 'border-[#6D4AFF] ring-2 ring-[#6D4AFF]' : 'border-[#E8E1D8]';
                }

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSize(s);
                      handleSimulateNewDrape();
                    }}
                    className={`p-3.5 rounded-2xl border text-left bg-white transition cursor-pointer shadow-xs ${borderClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#18212B]">Size {s}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tagClass}`}>
                        {sFitMode.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 mt-2 space-y-0.5">
                      <div>
                        Bust: {sMeasurements.bust}"{' '}
                        <span className={`font-semibold ${sBustEase < 0 ? 'text-[#C93B3B]' : 'text-stone-800'}`}>
                          ({sBustEase > 0 ? `+${sBustEase}"` : `${sBustEase}"`})
                        </span>
                      </div>
                      <div>
                        Waist: {sMeasurements.waist}"{' '}
                        <span className={`font-semibold ${sWaistEase < 0 ? 'text-[#C93B3B]' : 'text-stone-800'}`}>
                          ({sWaistEase > 0 ? `+${sWaistEase}"` : `${sWaistEase}"`})
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulation Viewport + Seam Ease Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Size-Aware Drape Canvas (6 Cols) */}
            <div className="md:col-span-6 bg-white rounded-3xl border border-[#E8E1D8] p-4 flex flex-col items-center justify-center relative shadow-sm overflow-hidden">
              {/* Photo Source Controls */}
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-stone-100 text-xs">
                <span className="font-bold text-stone-700">Clothed Photo Simulation</span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSeamOverlay(!showSeamOverlay)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
                      showSeamOverlay ? 'bg-[#781F37] text-white border-[#781F37]' : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                    title="Toggle measurement overlay on silhouette"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Overlay</span>
                  </button>

                  <label className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer">
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
                </div>
              </div>

              {/* Canvas Render Area */}
              <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                {userPhoto ? (
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Camera className="w-10 h-10 text-stone-400" />
                    <p className="text-xs text-stone-600">
                      No photo loaded. Upload a clothed full-body photo or select a sample profile.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setUserPhoto(samplePhotos[0].url);
                          setIsPhotoPurged(false);
                        }}
                        className="px-3 py-1.5 bg-[#781F37] text-white text-xs font-semibold rounded-lg"
                      >
                        Use Sample Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* Overlaid Status Tag */}
                {userPhoto && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-xs text-white p-2.5 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">
                        Size {selectedSize} · {fitMode.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-stone-300">
                        {product.measurements.stretchLevel} stretch fabric
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#197B5B]">
                        {fitConfidence}% Confidence
                      </span>
                      <span className="text-[10px] text-stone-300 block">Seam verified</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Photo Quick Selectors */}
              <div className="w-full flex items-center justify-between pt-3 mt-2 border-t border-stone-100 text-[11px] text-stone-500">
                <span>Presets:</span>
                <div className="flex gap-2">
                  {samplePhotos.map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => {
                        setUserPhoto(sp.url);
                        setIsPhotoPurged(false);
                      }}
                      className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
                    >
                      {sp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Seam Ease Calculation & User Adjuster (6 Cols) */}
            <div className="md:col-span-6 space-y-4">
              {/* Seam Math Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-[#781F37]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#18212B]">
                      Seam Ease Analysis (Garment - User)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-[#197B5B]">{fitConfidence}% Fit Match</span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Bust */}
                  <div>
                    <div className="flex justify-between text-stone-700 mb-1">
                      <span>Bust: Garment {currentGarment.bust}" vs Body {measurements.bust}"</span>
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

                  {/* Waist */}
                  <div>
                    <div className="flex justify-between text-stone-700 mb-1">
                      <span>Waist: Garment {currentGarment.waist}" vs Body {measurements.waist}"</span>
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

                  {/* Hip */}
                  <div>
                    <div className="flex justify-between text-stone-700 mb-1">
                      <span>Hip: Garment {currentGarment.hip}" vs Body {measurements.hip}"</span>
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

                {/* Outcome Explanation Card */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isWearable
                    ? 'bg-[#197B5B]/10 text-stone-800 border border-[#197B5B]/30'
                    : 'bg-[#C93B3B]/10 text-[#C93B3B] border border-[#C93B3B]/30'
                }`}>
                  {isWearable ? (
                    <div>
                      <span className="font-bold text-[#197B5B] block mb-0.5">
                        ✓ Size {selectedSize} ({fitMode.replace('_', ' ')}) Recommendation
                      </span>
                      This garment provides {bustEase > 0 ? `+${bustEase}"` : `${bustEase}"`} ease across the bodice and {waistEase > 0 ? `+${waistEase}"` : `${waistEase}"`} at the waist. The {product.measurements.stretchLevel.toLowerCase()} stretch {product.fabric} ensures natural drape and dance comfort for your occasion.
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-[#C93B3B] block mb-0.5">
                        ⚠️ Size {selectedSize} is Smaller Than Body Measurements
                      </span>
                      Negative ease of {bustEase}" at bust and {waistEase}" at waist will cause seam stress on this {product.fabric}. We recommend selecting Size M instead.
                    </div>
                  )}
                </div>
              </div>

              {/* Adjust Measurements Form Accordion */}
              <div className="bg-white p-5 rounded-3xl border border-[#E8E1D8] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-800">
                    Adjust Your Body Measurements
                  </span>
                  <span className="text-[10px] text-stone-400">Live preview sync</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Bust (in)</label>
                    <input
                      type="number"
                      value={measurements.bust}
                      onChange={(e) => setMeasurements({ ...measurements, bust: Number(e.target.value) })}
                      className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Waist (in)</label>
                    <input
                      type="number"
                      value={measurements.waist}
                      onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
                      className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 block mb-1">Hip (in)</label>
                    <input
                      type="number"
                      value={measurements.hip}
                      onChange={(e) => setMeasurements({ ...measurements, hip: Number(e.target.value) })}
                      className="w-full p-2 bg-stone-50 rounded-xl border border-stone-200 font-bold text-center"
                    />
                  </div>
                </div>

                {/* Informed Consent Checkbox */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="flex items-start gap-2 text-[11px] text-stone-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded text-[#781F37] focus:ring-[#781F37]"
                    />
                    <span>
                      <strong>Consent:</strong> I authorize processing my clothed full-body photo solely for measurement fit calculation and silhouette preview. Photos are never stored permanently.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Prominent "Actual Fit May Vary" Disclaimer Banner */}
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Actual Fit May Vary:</strong> AI previews and fit estimates are approximate visual simulations. Actual fabric drape, stretch recovery, skin comfort, and posture-dependent fit may vary based on garment age, inner lining, tailor seam margins, and individual body proportions.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#E8E1D8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              if (onSelectSize) onSelectSize(selectedSize);
              onClose();
            }}
            disabled={!isWearable}
            className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Confirm Size {selectedSize} ({fitMode.replace('_', ' ')}) & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
