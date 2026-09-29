import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  allUsers: User[];
  savedProductIds: string[];
  toggleSaveProduct: (id: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshUsers: () => Promise<void>;
}

const DEFAULT_ANANYA: User = {
  id: 'usr_ananya',
  name: 'Ananya Sharma',
  email: 'ananya@rewear.in',
  phone: '+91 98401 23456',
  role: 'CUSTOMER',
  city: 'Chennai',
  locality: 'T. Nagar',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  profileCompletion: 82,
  verifiedEmail: true,
  verifiedPhone: true,
  verifiedPayment: true,
  verifiedIdentity: false,
  measurements: {
    bust: 36,
    waist: 28,
    hip: 38,
    height: 165,
    preferredFit: 'regular'
  },
  stylePreferences: ['Glam', 'Modern Traditional', 'Couture', 'Minimal Elegance'],
  completedRentals: 4,
  onTimeReturnRate: 100
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_ANANYA);
  const [allUsers, setAllUsers] = useState<User[]>([DEFAULT_ANANYA]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>(['prod_gwn_1024', 'prod_sar_3042']);
  const [selectedCity, setSelectedCity] = useState<string>('Chennai');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users);
        const match = data.users.find((u: User) => u.id === currentUser.id);
        if (match) setCurrentUser(match);
      }
    } catch {
      // offline or initial loading
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      showToast(`Switched account to ${user.name} (${user.role})`);
    }
  };

  const switchRole = (role: UserRole) => {
    const user = allUsers.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      showToast(`Active View: ${role.replace('_', ' ')} (${user.name})`);
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
      showToast(`Switched role to ${role}`);
    }
  };

  const toggleSaveProduct = (id: string) => {
    setSavedProductIds(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved wardrobe');
        return prev.filter(x => x !== id);
      } else {
        showToast('Saved to your circular wishlist');
        return [...prev, id];
      }
    });
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUser.id },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        showToast('Profile updated successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        allUsers,
        savedProductIds,
        toggleSaveProduct,
        selectedCity,
        setSelectedCity,
        switchUser,
        switchRole,
        updateProfile,
        toastMessage,
        showToast,
        refreshUsers
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#18212B] text-white px-5 py-3 rounded-xl shadow-xl border border-[#E8E1D8]/20 animate-fade-in text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-[#197B5B] animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
