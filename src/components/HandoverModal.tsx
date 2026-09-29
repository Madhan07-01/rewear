import React, { useState } from 'react';
import { Order } from '../types';
import { QrCode, CheckCircle2, Camera, ShieldCheck, X } from 'lucide-react';

interface HandoverModalProps {
  order: Order;
  onClose: () => void;
  onConfirmHandover: (params: {
    verifiedMethod: 'QR' | 'OTP';
    frontPhoto: string;
    detailPhoto: string;
    conditionConfirmed: string;
    notes?: string;
  }) => Promise<void>;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  order,
  onClose,
  onConfirmHandover
}) => {
  const [method, setMethod] = useState<'QR' | 'OTP'>('QR');
  const [enteredOtp, setEnteredOtp] = useState(order.pickupOtp);
  const [conditionNotes, setConditionNotes] = useState('Immaculate condition verified in person; no pulls or zipper issues.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photographic checklist sample photos
  const frontPhoto = order.productImage;
  const detailPhoto = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';

  const handleVerify = async () => {
    setIsSubmitting(true);
    await onConfirmHandover({
      verifiedMethod: method,
      frontPhoto,
      detailPhoto,
      conditionConfirmed: 'Excellent - Dual Handover Approved',
      notes: conditionNotes
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-[#FFF9F1] text-[#18212B] w-full max-w-xl max-h-[90vh] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E1D8] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#197B5B]/10 border border-[#197B5B]/30 flex items-center justify-center text-[#197B5B]">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#197B5B]">
                Dual Handover Verification
              </span>
              <h3 className="font-serif-couture text-xl font-bold text-[#18212B]">
                Pass for Order {order.orderNumber}
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
          {/* QR & OTP Pass Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E1D8] text-center space-y-3">
            <div className="flex justify-center">
              {/* Simulated stylized QR Code box */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner flex flex-col items-center">
                <div className="w-40 h-40 bg-[#18212B] rounded-xl flex items-center justify-center text-[#FFF9F1] p-3 text-center">
                  <div className="space-y-1">
                    <QrCode className="w-16 h-16 mx-auto text-[#C89228]" />
                    <span className="text-[10px] font-mono tracking-widest block text-stone-300">
                      {order.pickupQrCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs text-[#6F747A] block font-medium">Or Use 6-Digit Pickup OTP</span>
              <span className="font-mono text-3xl font-black tracking-widest text-[#781F37] block mt-1">
                {order.pickupOtp}
              </span>
              <span className="text-[11px] text-[#197B5B] font-semibold mt-1 block">
                Share with counter lead or customer during in-person pickup
              </span>
            </div>
          </div>

          {/* Condition Photographic Checklist */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E1D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#6F747A]">
                Condition Evidence Photos
              </span>
              <span className="text-[11px] text-[#197B5B] font-semibold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> 2 Photos Captured
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <img
                  src={frontPhoto}
                  alt="Front View"
                  className="w-full h-28 object-cover rounded-xl border border-stone-200"
                />
                <span className="text-[10px] text-stone-500 block text-center">1. Full Bodice & Hem</span>
              </div>
              <div className="space-y-1">
                <img
                  src={detailPhoto}
                  alt="Detail View"
                  className="w-full h-28 object-cover rounded-xl border border-stone-200"
                />
                <span className="text-[10px] text-stone-500 block text-center">2. Embroidery & Zipper</span>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-[#18212B] block mb-1">
                Joint Inspection Notes
              </label>
              <textarea
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E8E1D8] bg-stone-50 text-[#18212B] focus:ring-1 focus:ring-[#781F37]"
              />
            </div>
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="pt-4 border-t border-[#E8E1D8] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-black cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#197B5B] hover:bg-[#146349] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Verifying...' : 'Confirm Handover & Activate Rental'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
