import React from 'react';
import { Product } from '../types';
import { ShieldCheck, Sparkles, CheckCircle2, History, Droplets, Leaf, ArrowRight, X } from 'lucide-react';

interface DigitalPassportModalProps {
  product: Product;
  onClose: () => void;
}

export const DigitalPassportModal: React.FC<DigitalPassportModalProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D8] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#197B5B]/10 border border-[#197B5B]/30 flex items-center justify-center text-[#197B5B]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[#197B5B]">
                  Circular Garment Passport
                </span>
                <span className="text-xs text-[#6F747A]">·</span>
                <span className="text-xs font-mono font-bold text-[#18212B]">{product.productCode}</span>
              </div>
              <h3 className="font-serif-couture text-xl sm:text-2xl font-bold text-[#18212B]">
                {product.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          {/* Garment Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-[#E8E1D8]">
            <div className="text-center p-2">
              <span className="text-xs text-[#6F747A] block font-medium">Wear Count</span>
              <span className="font-serif-couture text-2xl font-bold text-[#781F37]">{product.usageCount}</span>
              <span className="text-[10px] text-[#197B5B] block font-semibold">Active Life</span>
            </div>
            <div className="text-center p-2 border-l border-stone-100">
              <span className="text-xs text-[#6F747A] block font-medium">Usage Days</span>
              <span className="font-serif-couture text-2xl font-bold text-[#18212B]">{product.usageDays}</span>
              <span className="text-[10px] text-[#6F747A] block">Total Days</span>
            </div>
            <div className="text-center p-2 border-l border-stone-100">
              <span className="text-xs text-[#6F747A] block font-medium">Condition</span>
              <span className="font-serif-couture text-2xl font-bold text-[#197B5B]">{product.condition}</span>
              <span className="text-[10px] text-[#197B5B] block font-semibold">QC Certified</span>
            </div>
            <div className="text-center p-2 border-l border-stone-100">
              <span className="text-xs text-[#6F747A] block font-medium">Repairs Logged</span>
              <span className="font-serif-couture text-2xl font-bold text-[#C89228]">{product.repairsCount}</span>
              <span className="text-[10px] text-[#6F747A] block">Restored</span>
            </div>
          </div>

          {/* Eco Savings Banner */}
          <div className="bg-[#197B5B]/10 rounded-2xl p-4 border border-[#197B5B]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="w-8 h-8 text-[#197B5B]" />
              <div>
                <h4 className="text-sm font-bold text-[#197B5B]">Circular Environmental Impact</h4>
                <p className="text-xs text-stone-600">
                  By recirculating this piece across {product.usageCount} occasions instead of fast fashion:
                </p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="font-bold text-sm text-[#197B5B]">~{product.usageCount * 14.5} kg</span>
                <span className="text-[10px] block text-stone-500">CO₂ Avoided</span>
              </div>
              <div>
                <span className="font-bold text-sm text-[#197B5B]">~{product.usageCount * 850} L</span>
                <span className="text-[10px] block text-stone-500">Water Saved</span>
              </div>
            </div>
          </div>

          {/* Fabric & Provenance Details */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
              Craftsmanship & Provenance
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6F747A] block">Fabric Composition</span>
                <span className="font-semibold text-[#18212B]">{product.fabric}</span>
              </div>
              <div>
                <span className="text-[#6F747A] block">Atelier / Brand</span>
                <span className="font-semibold text-[#18212B]">{product.brand}</span>
              </div>
              <div>
                <span className="text-[#6F747A] block">Colour & Craft</span>
                <span className="font-semibold text-[#18212B]">{product.colour}</span>
              </div>
              <div>
                <span className="text-[#6F747A] block">Current Local Wardrobe</span>
                <span className="font-semibold text-[#18212B]">{product.locality}, {product.city}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Event Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-[#781F37]" />
              <h4 className="text-xs uppercase tracking-wider font-bold text-[#18212B]">
                Lifecycle & Care History
              </h4>
            </div>

            <div className="space-y-3 relative pl-4 border-l-2 border-[#197B5B]/30 ml-2">
              {product.passportEvents && product.passportEvents.length > 0 ? (
                product.passportEvents.map((evt) => (
                  <div key={evt.id} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#197B5B] ring-4 ring-[#FFF9F1]" />
                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E1D8]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#18212B]">{evt.title}</span>
                        <span className="text-[#6F747A]">{evt.date}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#6F747A] italic py-2">
                  No previous repairs recorded. This garment is maintained in pristine condition.
                </div>
              )}
            </div>
          </div>

          {/* ReVive Journey Timeline Block */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#197B5B]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#197B5B]/15 text-[#197B5B] flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#18212B]">
                  ReVive Journey
                </h4>
              </div>
              <span className="text-[10px] text-[#197B5B] font-bold bg-[#197B5B]/10 px-2 py-0.5 rounded-full">
                Next-Life Passport
              </span>
            </div>

            {/* ReVive Journey Entries */}
            <div className="space-y-3 relative pl-4 border-l-2 border-[#197B5B]/40 ml-2">
              {/* Check if any specific ReVive events exist */}
              {product.passportEvents && product.passportEvents.some(e => e.eventType.startsWith('REVIVE_') || e.reviveDetails) ? (
                product.passportEvents
                  .filter(e => e.eventType.startsWith('REVIVE_') || e.reviveDetails)
                  .map(evt => (
                    <div key={evt.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#197B5B] ring-4 ring-white" />
                      <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#18212B] flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#197B5B] text-white">
                              {evt.reviveDetails?.route || 'REVIVE'}
                            </span>
                            {evt.title}
                          </span>
                          <span className="text-stone-400 text-[11px] font-mono">{evt.date}</span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {evt.description}
                        </p>
                        {evt.reviveDetails?.partnerName && (
                          <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-stone-500">
                            <span>Partner: <strong>{evt.reviveDetails.partnerName}</strong></span>
                            {evt.reviveDetails.weightKg && (
                              <span>· Weight: <strong>{evt.reviveDetails.weightKg} kg</strong></span>
                            )}
                            {evt.reviveDetails.payoutAmount && (
                              <span className="text-emerald-700 font-bold">· Payout: ₹{evt.reviveDetails.payoutAmount}</span>
                            )}
                            {evt.reviveDetails.receiptId && (
                              <span className="font-mono">· Receipt: {evt.reviveDetails.receiptId}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-xs text-stone-500 space-y-2 py-1">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="font-semibold text-[#18212B] block mb-0.5">
                      Next-Life Ready
                    </span>
                    <p className="text-[11px] text-stone-600">
                      When this piece reaches retirement or fair condition, ReVive enables:
                      Repaired and relisted · Donation scheduled · Donated for reuse · Recycler quote requested · Recycler payout recorded · Upcycling request submitted · Upcycled · Responsible disposal confirmed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E8E1D8] flex items-center justify-between text-xs text-[#6F747A]">
          <span className="flex items-center gap-1.5 text-[#197B5B] font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Verified on ReWear Circular Ledger
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl font-semibold shadow-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
