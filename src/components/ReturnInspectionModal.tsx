import React, { useState } from 'react';
import { Order, ProductCondition } from '../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, Camera, Sparkles, X } from 'lucide-react';

interface ReturnInspectionModalProps {
  order: Order;
  onClose: () => void;
  onCompleteInspection: (params: {
    conditionScore: ProductCondition;
    depositOutcome: 'FULL_REFUND' | 'PARTIAL_DEDUCTION' | 'DISPUTED';
    deductionAmount?: number;
    deductionReason?: string;
    repairEstimate?: string;
    evidencePhotos?: string[];
  }) => Promise<void>;
}

export const ReturnInspectionModal: React.FC<ReturnInspectionModalProps> = ({
  order,
  onClose,
  onCompleteInspection
}) => {
  const [conditionScore, setConditionScore] = useState<ProductCondition>('Excellent');
  const [outcome, setOutcome] = useState<'FULL_REFUND' | 'PARTIAL_DEDUCTION' | 'DISPUTED'>('FULL_REFUND');
  const [deductionAmount, setDeductionAmount] = useState<number>(200);
  const [deductionReason, setDeductionReason] = useState<string>('Minor hem stitching reinforcement needed after farewell dance.');
  const [repairEstimate, setRepairEstimate] = useState<string>('₹200 atelier hand-stitch repair');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onCompleteInspection({
      conditionScore,
      depositOutcome: outcome,
      deductionAmount: outcome === 'PARTIAL_DEDUCTION' ? deductionAmount : 0,
      deductionReason: outcome !== 'FULL_REFUND' ? deductionReason : undefined,
      repairEstimate: outcome !== 'FULL_REFUND' ? repairEstimate : undefined,
      evidencePhotos: [order.productImage]
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-2xl max-h-[92vh] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D8] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#781F37]/10 border border-[#781F37]/30 flex items-center justify-center text-[#781F37]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#781F37]">
                Seller Return QC & Deposit Inspection
              </span>
              <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
                {order.productTitle} ({order.orderNumber})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Side by Side Photo Comparison */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
                Condition Photo Verification
              </span>
              <span className="text-[11px] text-[#197B5B] font-semibold">
                Renter: {order.customerName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] text-stone-500 block mb-1">Handover Dispatch Photo</span>
                <img
                  src={order.productImage}
                  alt="Handover View"
                  className="w-full h-36 object-cover rounded-xl border border-stone-200"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#197B5B] font-semibold block mb-1">Return Received Photo</span>
                <img
                  src={order.productImage}
                  alt="Return View"
                  className="w-full h-36 object-cover rounded-xl border border-emerald-300 ring-2 ring-[#197B5B]/20"
                />
              </div>
            </div>
          </div>

          {/* Condition Score Selection */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] space-y-3">
            <label className="text-xs uppercase tracking-wider font-bold text-[#6F747A] block">
              Certified Return Condition
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(['Excellent', 'Good', 'Fair', 'Minor damage'] as ProductCondition[]).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setConditionScore(cond)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    conditionScore === cond
                      ? 'bg-[#197B5B] text-white border-[#197B5B] shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Resolution Decision */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] space-y-3">
            <label className="text-xs uppercase tracking-wider font-bold text-[#6F747A] block">
              Deposit Escrow Resolution (Held: ₹{order.pricing.refundableDeposit.toLocaleString('en-IN')})
            </label>

            <div className="space-y-2">
              {/* Option 1: Full Refund */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  outcome === 'FULL_REFUND'
                    ? 'border-[#197B5B] bg-[#197B5B]/5 ring-1 ring-[#197B5B]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === 'FULL_REFUND'}
                  onChange={() => setOutcome('FULL_REFUND')}
                  className="mt-0.5 text-[#197B5B] focus:ring-[#197B5B]"
                />
                <div>
                  <div className="text-xs font-bold text-[#18212B]">
                    Approve 100% Full Refund (₹{order.pricing.refundableDeposit.toLocaleString('en-IN')})
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Garment returned in agreed condition with no missing accessories. Instant refund initiated.
                  </div>
                </div>
              </label>

              {/* Option 2: Partial Deduction */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  outcome === 'PARTIAL_DEDUCTION'
                    ? 'border-[#C89228] bg-[#C89228]/5 ring-1 ring-[#C89228]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === 'PARTIAL_DEDUCTION'}
                  onChange={() => setOutcome('PARTIAL_DEDUCTION')}
                  className="mt-0.5 text-[#C89228] focus:ring-[#C89228]"
                />
                <div>
                  <div className="text-xs font-bold text-[#18212B]">
                    Propose Repair / Cleaning Deduction
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Covers minor stitching, stain cleaning, or missing low-value accessory.
                  </div>
                </div>
              </label>

              {/* Option 3: Dispute */}
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  outcome === 'DISPUTED'
                    ? 'border-[#C93B3B] bg-[#C93B3B]/5 ring-1 ring-[#C93B3B]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="outcome"
                  checked={outcome === 'DISPUTED'}
                  onChange={() => setOutcome('DISPUTED')}
                  className="mt-0.5 text-[#C93B3B] focus:ring-[#C93B3B]"
                />
                <div>
                  <div className="text-xs font-bold text-[#18212B]">
                    Escalate to Admin Dispute Review
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Severe damage or non-return requiring platform mediation.
                  </div>
                </div>
              </label>
            </div>

            {/* Partial deduction details form */}
            {outcome === 'PARTIAL_DEDUCTION' && (
              <div className="p-3 bg-stone-50 rounded-xl space-y-2 border border-stone-200 text-xs mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700">Deduction Amount (₹)</span>
                  <input
                    type="number"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(Number(e.target.value))}
                    className="w-28 p-1.5 rounded-lg border border-stone-300 text-right font-bold text-[#781F37]"
                    min={50}
                    max={order.pricing.refundableDeposit}
                  />
                </div>
                <div>
                  <span className="font-semibold text-stone-700 block mb-1">Reason & Repair Estimate</span>
                  <textarea
                    value={deductionReason}
                    onChange={(e) => setDeductionReason(e.target.value)}
                    rows={2}
                    className="w-full p-2 rounded-lg border border-stone-300"
                    placeholder="Describe specific cleaning or repair required..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E8E1D8] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer text-white ${
              outcome === 'FULL_REFUND' ? 'bg-[#197B5B] hover:bg-[#146349]' : 'bg-[#781F37] hover:bg-[#5E182B]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Processing...'
                : outcome === 'FULL_REFUND'
                ? `Approve Full ₹${order.pricing.refundableDeposit.toLocaleString('en-IN')} Refund`
                : 'Submit QC Decision'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
