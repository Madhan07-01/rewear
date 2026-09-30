import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Sparkles, Heart, User as UserIcon, Menu, X, Shield, ShoppingBag, Store, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenLocationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenLocationModal }) => {
  const { currentUser, switchUser, allUsers, savedProductIds, selectedCity } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Browse Wardrobe', path: '/catalog' },
    { label: 'AI Style Match', path: '/style-match', icon: Sparkles, highlight: true },
    { label: 'AI Fit Studio', path: '/tryon', icon: Sparkles, highlight: true },
    { label: 'My Rentals', path: '/my-rentals', role: 'CUSTOMER' },
    { label: 'Seller Console', path: '/seller', role: ['B2C_SELLER', 'B2B_SELLER'] },
    { label: '♻ ReVive Hub', path: '/revive', role: ['B2C_SELLER', 'B2B_SELLER', 'ADMIN'] },
    { label: 'Admin Governance', path: '/admin', role: 'ADMIN' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FFF9F1]/95 backdrop-blur-md border-b border-[#E8E1D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => onNavigate('/')}
              className="flex flex-col text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-serif-couture text-2xl sm:text-3xl font-black tracking-tight text-[#18212B] group-hover:text-[#781F37] transition-colors">
                  ReWear
                </span>
                <span className="w-2 h-2 rounded-full bg-[#197B5B]" title="Hyperlocal verified circular fashion" />
              </div>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#6F747A] hidden sm:block">
                Wear the moment. Not the price tag.
              </span>
            </button>

            {/* Hyperlocal Location Chip */}
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100/80 hover:bg-stone-200/80 text-xs font-medium text-[#18212B] border border-[#E8E1D8] transition cursor-pointer"
              title="Change your hyperlocal delivery & pickup city"
            >
              <MapPin className="w-3.5 h-3.5 text-[#781F37]" />
              <span className="font-semibold">{selectedCity}</span>
              <span className="text-stone-400">·</span>
              <span className="text-[#6F747A] text-[11px]">T. Nagar</span>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.path)}
                  className={`relative text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 py-1 ${
                    isActive
                      ? 'text-[#781F37] font-semibold'
                      : 'text-[#18212B] hover:text-[#781F37]'
                  } ${item.highlight ? 'text-[#6D4AFF] hover:text-[#5535db]' : ''}`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#6D4AFF]" />}
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781F37] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Role Switcher & Actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('/catalog?filter=saved')}
              className="relative p-2 rounded-full hover:bg-stone-200/60 text-[#18212B] transition cursor-pointer"
              title="Saved Outfits"
            >
              <Heart className="w-5 h-5" />
              {savedProductIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#781F37] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedProductIds.length}
                </span>
              )}
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E8E1D8] shadow-sm hover:border-[#781F37]/40 transition text-xs font-semibold cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-[#197B5B]"
                />
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-[#18212B] leading-none">{currentUser.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-[#781F37] leading-none mt-0.5 uppercase tracking-wider font-semibold">
                    {currentUser.role.replace('_', ' ')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {/* Dropdown for instant user/role switching */}
              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E8E1D8] py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Switch Active Persona (Hackathon Testing)
                  </div>
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setRoleDropdownOpen(false);
                        if (user.role === 'B2C_SELLER' || user.role === 'B2B_SELLER') {
                          onNavigate('/seller');
                        } else if (user.role === 'ADMIN') {
                          onNavigate('/admin');
                        } else {
                          onNavigate('/profile');
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-stone-50 transition cursor-pointer ${
                        currentUser.id === user.id ? 'bg-[#FFF9F1] font-semibold' : ''
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#18212B] truncate">{user.name}</div>
                        <div className="text-[10px] text-[#6F747A] capitalize">
                          {user.role.toLowerCase().replace('_', ' ')} · {user.locality}
                        </div>
                      </div>
                      {currentUser.id === user.id && (
                        <span className="w-2 h-2 rounded-full bg-[#197B5B]" />
                      )}
                    </button>
                  ))}
                  <div className="border-t border-stone-100 mt-1 pt-1 px-3 py-1 flex justify-between items-center text-[11px]">
                    <button
                      onClick={() => {
                        onNavigate('/profile');
                        setRoleDropdownOpen(false);
                      }}
                      className="text-[#781F37] font-semibold hover:underline"
                    >
                      View Full Profile
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-stone-100 text-[#18212B]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF9F1] border-b border-[#E8E1D8] px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onNavigate(item.path);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between text-left py-2.5 text-base font-medium text-[#18212B] hover:text-[#781F37] border-b border-stone-200/50"
            >
              <span>{item.label}</span>
              {item.highlight && <span className="text-xs text-[#6D4AFF] font-bold">AI Powered</span>}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                onNavigate('/profile');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 text-center text-sm font-semibold text-[#781F37] bg-white rounded-lg border border-[#E8E1D8]"
            >
              My Profile & Measurements
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
