import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserMeasurements } from '../types';
import { ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Ruler, User as UserIcon, Lock } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [measurements, setMeasurements] = useState<UserMeasurements>(
    currentUser.measurements || {
      bust: 36,
      waist: 28,
      hip: 38,
      height: 165,
      preferredFit: 'regular'
    }
  );
  const [preferredFit, setPreferredFit] = useState<'fitted' | 'regular' | 'relaxed' | 'oversized'>(
    currentUser.measurements?.preferredFit || 'regular'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMeasurements = async () => {
    setIsSaving(true);
    await updateProfile({
      measurements: {
        ...measurements,
        preferredFit
      }
    });
    setIsSaving(false);
  };

  const handleVerifyIdentity = async () => {
    await updateProfile({
      verifiedIdentity: true,
      profileCompletion: 100
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D8] shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-24 h-24 rounded-full object-cover ring-4 ring-[#FFF9F1] shadow-md"
        />

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#18212B]">
              {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#197B5B]/10 text-[#197B5B] text-xs font-bold uppercase tracking-wider">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          <p className="text-xs text-[#6F747A]">
            {currentUser.city} ({currentUser.locality}) · {currentUser.email} · {currentUser.phone}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-stone-600">
            <span><strong>{currentUser.completedRentals}</strong> Completed Rentals</span>
            <span>·</span>
            <span><strong>{currentUser.onTimeReturnRate}%</strong> On-Time Return Rate</span>
          </div>
        </div>

        {/* Profile Completion Dial */}
        <div className="bg-[#FFF9F1] p-4 rounded-2xl border border-[#E8E1D8] text-center min-w-[130px]">
          <span className="text-[10px] text-[#6F747A] uppercase font-bold tracking-wider block">
            Profile Strength
          </span>
          <span className="font-serif-couture text-3xl font-bold text-[#781F37] block mt-0.5">
            {currentUser.profileCompletion}%
          </span>
          <span className="text-[10px] text-[#197B5B] font-semibold">
            {currentUser.profileCompletion >= 80 ? 'Verified Renter' : 'Building Trust'}
          </span>
        </div>
      </div>

      {/* Verification & Premium Rental Readiness (Positive Messaging Constitution) */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
              Trust & Rental Tier Access
            </h3>
            <p className="text-xs text-[#6F747A]">
              We evaluate platform safety to unlock higher tier garments without ever displaying raw trust scores.
            </p>
          </div>
          <span className="text-xs font-bold text-[#197B5B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Standard & Premium Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
            <span className="font-medium">Phone & WhatsApp Verified (+91 98401...)</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
            <span className="font-medium">Email Verified (ananya@rewear.in)</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
            <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
            <span className="font-medium">UPI & Payment Method Pre-Authorized</span>
          </div>

          {/* Identity Verification Check */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2.5">
              {currentUser.verifiedIdentity ? (
                <CheckCircle2 className="w-4 h-4 text-[#197B5B]" />
              ) : (
                <Lock className="w-4 h-4 text-[#C89228]" />
              )}
              <span className="font-medium">
                {currentUser.verifiedIdentity ? 'Government ID Verified (DigiLocker)' : 'High-Value Identity Check'}
              </span>
            </div>

            {!currentUser.verifiedIdentity && (
              <button
                onClick={handleVerifyIdentity}
                className="px-2.5 py-1 bg-[#C89228] text-black font-bold rounded-lg text-[10px] hover:bg-[#b07d1e] cursor-pointer"
              >
                Verify ID
              </button>
            )}
          </div>
        </div>

        {/* Positive Action Message */}
        <div className="p-3.5 bg-[#FFF9F1] rounded-2xl border border-[#C89228]/40 text-xs text-stone-700 leading-relaxed">
          <strong>Couture Readiness:</strong> You are fully authorized to reserve items up to ₹25,000 retail value. To reserve luxury bridal items (like the Designer Ivory Lehenga), verify your government ID with one click.
        </div>
      </div>

      {/* Body Measurements Profile */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E1D8] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#781F37]" />
            <div>
              <h3 className="font-serif-couture text-lg font-bold text-[#18212B]">
                Your Fit Profile & Measurements
              </h3>
              <p className="text-xs text-[#6F747A]">
                Used by our AI fit engine to calculate seam ease and try-on draping.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Bust (inches)</label>
            <input
              type="number"
              value={measurements.bust}
              onChange={(e) => setMeasurements({ ...measurements, bust: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-center"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Waist (inches)</label>
            <input
              type="number"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-center"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Hip (inches)</label>
            <input
              type="number"
              value={measurements.hip}
              onChange={(e) => setMeasurements({ ...measurements, hip: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-center"
            />
          </div>
          <div>
            <label className="font-bold text-stone-700 block mb-1">Height (cm)</label>
            <input
              type="number"
              value={measurements.height}
              onChange={(e) => setMeasurements({ ...measurements, height: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl border border-stone-300 font-bold text-center"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="font-bold text-stone-700 text-xs block mb-2">Preferred Fit Silhouette</label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {(['fitted', 'regular', 'relaxed', 'oversized'] as const).map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => setPreferredFit(fit)}
                className={`py-2 text-center font-bold rounded-xl border capitalize transition cursor-pointer ${
                  preferredFit === fit
                    ? 'bg-[#781F37] text-white border-[#781F37]'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 text-right">
          <button
            onClick={handleSaveMeasurements}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#781F37] hover:bg-[#5E182B] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Update Measurements'}
          </button>
        </div>
      </div>
    </div>
  );
};
