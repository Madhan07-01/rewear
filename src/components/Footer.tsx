import React from 'react';
import { ShieldCheck, RefreshCw, Sparkles, MapPin, HeartHandshake } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#18212B] text-[#FFF9F1] pt-16 pb-24 border-t border-[#E8E1D8]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Circular Impact Strip */}
        <div className="bg-white/5 rounded-2xl p-6 sm:p-8 border border-white/10 mb-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#C89228]">12,480 kg</div>
            <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-semibold">CO₂ Emissions Avoided</div>
          </div>
          <div>
            <div className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#197B5B]">9.4 Lakh L</div>
            <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-semibold">Textile Water Saved</div>
          </div>
          <div>
            <div className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#FFF9F1]">3,420+</div>
            <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-semibold">Moments Celebrated</div>
          </div>
          <div>
            <div className="font-serif-couture text-2xl sm:text-3xl font-bold text-[#6D4AFF]">100%</div>
            <div className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-semibold">Escrow Deposit Refund Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif-couture text-2xl font-black text-white">ReWear</span>
              <span className="w-2 h-2 rounded-full bg-[#197B5B]" />
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              India's hyperlocal circular occasionwear marketplace. Rent, buy, and share designer outfits already available right in your neighbourhood.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C89228]">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold italic">“Wear the moment. Not the price tag.”</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#C89228] mb-4">Explore</h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button onClick={() => onNavigate('/catalog?category=Gown')} className="hover:text-white transition">
                  College Farewell Gowns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/catalog?category=Lehenga')} className="hover:text-white transition">
                  Bridal & Sangeet Lehengas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/catalog?category=Blazer')} className="hover:text-white transition">
                  Placement & Interview Blazers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/catalog?category=Saree')} className="hover:text-white transition">
                  Pure Kanjivaram Silk Sarees
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/style-match')} className="hover:text-white text-[#6D4AFF] font-medium transition">
                  AI Style & Fit Match Wizard
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Deposit Protection */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#197B5B] mb-4">Trust & Security</h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#197B5B]" />
                <span>Segregated Escrow Deposit Vault</span>
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-[#197B5B]" />
                <span>Dual QR & OTP Handover Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-[#197B5B]" />
                <span>Photographic Condition Inspection</span>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="text-stone-400 hover:text-stone-200 mt-2 block">
                  Platform Policies & Governance
                </button>
              </li>
            </ul>
          </div>

          {/* Hyperlocal Hubs */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#FFF9F1] mb-4">Hyperlocal Hubs</h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-3">
              Fast same-day pickup and doorstep courier delivery in:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-300">
              <span className="px-2 py-1 bg-white/10 rounded">Chennai (T. Nagar · Alwarpet)</span>
              <span className="px-2 py-1 bg-white/10 rounded">Bengaluru (Indiranagar)</span>
              <span className="px-2 py-1 bg-white/10 rounded">Mumbai (Bandra)</span>
              <span className="px-2 py-1 bg-white/10 rounded">Hyderabad (Banjara Hills)</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <div>
            © 2026 ReWear Technologies India. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Refundable Deposit Escrow Guarantee</span>
            <span>·</span>
            <span>Digital Clothing Passport</span>
            <span>·</span>
            <span>Zero Slop Circular Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
