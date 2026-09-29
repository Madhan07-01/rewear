import React, { createContext, useContext, useState } from 'react';

export interface DemoStep {
  stepNumber: number;
  title: string;
  instruction: string;
  targetPath?: string;
  roleRequired?: 'CUSTOMER' | 'B2C_SELLER' | 'B2B_SELLER' | 'ADMIN';
}

export const HACKATHON_DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Login as Ananya',
    instruction: 'Meet Ananya (Student, Chennai) looking for an outfit for her College Farewell.',
    targetPath: '/',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 2,
    title: 'Start AI Style Match',
    instruction: 'Click "AI Style Match" or "Find My Look" in the hero section to open the 7-step wizard.',
    targetPath: '/style-match',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 3,
    title: 'Configure Preferences',
    instruction: 'Set: College Farewell, Size M, Glam Mood, ₹1,000 Budget, Chennai T. Nagar.',
    targetPath: '/style-match',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 4,
    title: '96% Best Match Hero Card',
    instruction: 'Review the Black & Gold Embroidered Gown matching Ananya with 96% confidence.',
    targetPath: '/style-match',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 5,
    title: 'Product Details & Passport',
    instruction: 'Inspect the Gown: 27 previous wears, 1 repair, ₹1,000 refundable deposit, 2.1 km away.',
    targetPath: '/product/prod_gwn_1024',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 6,
    title: 'AI Fit Preview & Virtual Try-On',
    instruction: 'Open AI Fit Preview: compare Size M (+1" ease) vs Size L (+3.5" ease), view virtual try-on.',
    targetPath: '/product/prod_gwn_1024?action=tryon',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 7,
    title: 'Reserve via Hyperlocal Pickup',
    instruction: 'Click "Reserve Outfit", select In-Person Pickup at T. Nagar hub.',
    targetPath: '/checkout/prod_gwn_1024',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 8,
    title: 'Transparent Escrow Breakdown',
    instruction: 'Observe Rental ₹699, Escrow Security Deposit ₹1,000 (Refundable), Protection ₹79, Total ₹1,827.',
    targetPath: '/checkout/prod_gwn_1024',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 9,
    title: 'Generate Pickup QR & OTP',
    instruction: 'View the instant booking pass with 6-digit OTP (482910) and handover QR code.',
    targetPath: '/order/ord_101',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 10,
    title: 'Handover & Condition Evidence',
    instruction: 'Seller verifies QR scan and uploads photographic condition checklist (front, hem, zipper).',
    targetPath: '/order/ord_101',
    roleRequired: 'B2C_SELLER'
  },
  {
    stepNumber: 11,
    title: 'Active Rental & Return Pass',
    instruction: 'Item is active in Ananya’s closet. She initiates return after the farewell with return photos.',
    targetPath: '/my-rentals',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 12,
    title: 'Seller Return Inspection',
    instruction: 'Kavita reviews return photos against handover photos and approves "Full Refund".',
    targetPath: '/seller',
    roleRequired: 'B2C_SELLER'
  },
  {
    stepNumber: 13,
    title: 'Deposit Refund Initiated',
    instruction: 'Platform initiates instant refund of ₹1,000 back to Ananya’s UPI handle.',
    targetPath: '/my-rentals',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 14,
    title: 'Clothing Passport Update (27 → 28)',
    instruction: 'Check the gown’s Digital Passport: wear count incremented from 27 to 28, +14.8 kg CO2 saved!',
    targetPath: '/product/prod_gwn_1024',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 15,
    title: 'Premium Product: Ivory Lehenga',
    instruction: 'Examine ₹35,000 Lehenga: notice positive trust messaging "Additional verification required".',
    targetPath: '/product/prod_lhn_5008',
    roleRequired: 'CUSTOMER'
  },
  {
    stepNumber: 16,
    title: 'Seller & Admin Governance Console',
    instruction: 'Explore B2B Studio dashboard, deposit escrow liability tracking, and Admin policy rules.',
    targetPath: '/admin',
    roleRequired: 'ADMIN'
  }
];

interface DemoContextType {
  currentStepIndex: number;
  currentStep: DemoStep;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  jumpToStep: (index: number) => void;
  isTourOpen: boolean;
  setIsTourOpen: (open: boolean) => void;
  resetDemoData: () => Promise<void>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(true);

  const currentStep = HACKATHON_DEMO_STEPS[currentStepIndex];

  const goToNextStep = () => {
    if (currentStepIndex < HACKATHON_DEMO_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    if (index >= 0 && index < HACKATHON_DEMO_STEPS.length) {
      setCurrentStepIndex(index);
    }
  };

  const resetDemoData = async () => {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      setCurrentStepIndex(0);
      window.location.href = '/';
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        currentStepIndex,
        currentStep,
        goToNextStep,
        goToPrevStep,
        jumpToStep,
        isTourOpen,
        setIsTourOpen,
        resetDemoData
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within a DemoProvider');
  return context;
};
