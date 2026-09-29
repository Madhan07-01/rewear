export type UserRole = 'CUSTOMER' | 'B2C_SELLER' | 'B2B_SELLER' | 'ADMIN';

export type ProductCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Minor damage' | 'Major damage' | 'Retired';

export type ProductLifecycleStatus = 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'RETURNED' | 'INSPECTION' | 'REPAIR' | 'RETIRED';

export type OrderStatus =
  | 'DRAFT'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'SELLER_CONFIRMATION_PENDING'
  | 'CONFIRMED'
  | 'FULFILMENT_PENDING'
  | 'PICKUP_READY'
  | 'DELIVERY_PICKUP_PENDING'
  | 'IN_TRANSIT'
  | 'HANDED_OVER'
  | 'ACTIVE_RENTAL'
  | 'RETURN_PENDING'
  | 'RETURNED'
  | 'INSPECTION_PENDING'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export type DepositStatus =
  | 'PENDING'
  | 'HELD'
  | 'ELIGIBLE_FOR_REFUND'
  | 'REFUNDED'
  | 'PARTIALLY_DEDUCTED'
  | 'FULLY_DEDUCTED'
  | 'DISPUTED'
  | 'RESOLVED';

export type PremiumTier = 'STANDARD' | 'PREMIUM' | 'HIGH_VALUE' | 'LUXURY';

export type EligibilityStatus = 'PERMITTED' | 'VERIFY_REQUIRED' | 'DEPOSIT_UPLIFT' | 'MANUAL_REVIEW' | 'RESTRICTED';

export type FitMode = 'SNUG' | 'FITTED' | 'REGULAR' | 'RELAXED' | 'OVERSIZED' | 'NOT_RECOMMENDED';

export interface GarmentMeasurements {
  bust: number;     // in inches
  waist: number;    // in inches
  hip: number;      // in inches
  shoulder?: number;// in inches
  length: number;   // in inches
  stretchLevel: 'None' | 'Low' | 'Medium' | 'High';
}

export interface UserMeasurements {
  bust: number;
  waist: number;
  hip: number;
  height: number;    // in cm or inches
  preferredFit: 'fitted' | 'regular' | 'relaxed' | 'oversized';
}

export interface LifecycleEvent {
  id: string;
  date: string;
  eventType: 'ACQUISITION' | 'RENTAL_COMPLETED' | 'DRY_CLEAN' | 'REPAIR' | 'INSPECTION_PASSED' | 'CONDITION_UPDATE';
  title: string;
  description: string;
  location?: string;
  ecoImpact?: {
    co2SavedKg: number;
    waterSavedLiters: number;
  };
}

export interface Product {
  id: string;
  productCode: string; // e.g. GWN-1024
  title: string;
  category: 'Gown' | 'Lehenga' | 'Saree' | 'Blazer' | 'Anarkali' | 'Kurta Set' | 'Party Dress' | 'Sherwani' | 'Accessories';
  brand: string;
  colour: string;
  fabric: string;
  sizeLabel: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Free Size';
  rentalPricePerDay: number;
  rentalPrice3Days: number;
  purchasePrice?: number;
  retailValue: number;
  refundableDeposit: number;
  condition: ProductCondition;
  lifecycleStatus: ProductLifecycleStatus;
  city: string;
  locality: string;
  approxDistanceKm: number;
  premiumTier: PremiumTier;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  images: string[];
  description: string;
  occasion: string[];
  styleMood: string[];
  measurements: GarmentMeasurements;
  fitNotes: string;
  usageCount: number;
  usageDays: number;
  repairsCount: number;
  passportEvents: LifecycleEvent[];
  protectionAvailable: boolean;
  protectionPrice: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryCharge: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  city: string;
  locality: string;
  avatar: string;
  profileCompletion: number;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
  verifiedPayment: boolean;
  verifiedIdentity: boolean;
  measurements?: UserMeasurements;
  stylePreferences?: string[];
  completedRentals: number;
  onTimeReturnRate: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productCode: string;
  productImage: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  status: OrderStatus;
  startDate: string;
  endDate: string;
  rentalDays: number;
  fulfilmentMethod: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  pickupOtp: string;
  pickupQrCode: string;
  returnOtp: string;
  returnQrCode: string;
  pricing: {
    rentalAmount: number;
    refundableDeposit: number;
    deliveryCharge: number;
    protectionAmount: number;
    platformFee: number;
    totalPaidToday: number;
  };
  protectionPlanSelected: boolean;
  handoverEvidence?: {
    verifiedAt: string;
    verifiedMethod: 'QR' | 'OTP';
    frontPhoto: string;
    detailPhoto: string;
    conditionConfirmed: string;
    notes?: string;
  };
  returnEvidence?: {
    returnedAt: string;
    returnMethod: 'PICKUP' | 'DELIVERY';
    returnPhotos: string[];
    customerNotes?: string;
  };
  inspection?: {
    inspectedAt: string;
    conditionScore: ProductCondition;
    depositOutcome: 'FULL_REFUND' | 'PARTIAL_DEDUCTION' | 'DISPUTED';
    deductionAmount?: number;
    deductionReason?: string;
    repairEstimate?: string;
    evidencePhotos?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DepositRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: DepositStatus;
  heldAt: string;
  eligibleAt?: string;
  refundedAt?: string;
  refundTransactionId?: string;
  deductionAmount?: number;
  deductionReason?: string;
  deductionEvidence?: string[];
}

export interface DisputeCase {
  id: string;
  orderId: string;
  orderNumber: string;
  raisedBy: 'CUSTOMER' | 'SELLER';
  claimantName: string;
  reason: string;
  amountDisputed: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  evidenceUrls: string[];
  timeline: {
    date: string;
    actor: string;
    message: string;
  }[];
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isQuickReply?: boolean;
}

export interface PolicyConfig {
  commissionB2CPercent: number;
  commissionB2BPercent: number;
  depositMinPercent: number;
  depositDefaultMultiplier: number;
  cancellationRefundWindowHours: number;
  cancellationSellerConfirmedFeePercent: number;
  protectionDefaultRatePercent: number;
  protectionCoverageCap: number;
  premiumRetailThreshold: number;
  highValueRetailThreshold: number;
  luxuryRetailThreshold: number;
  identityVerificationMandatoryRetail: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  entityType: 'ORDER' | 'DEPOSIT' | 'PRODUCT' | 'USER' | 'POLICY' | 'DISPUTE';
  entityId: string;
  actor: string;
  details: string;
}

export interface TryOnJob {
  id: string;
  productId: string;
  userId: string;
  userPhotoUrl: string;
  selectedSize: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fitMode: FitMode;
  fitConfidencePercent: number;
  resultImageUrl?: string;
  fitDetails: {
    bustEase: number;
    waistEase: number;
    hipEase: number;
    comfortScore: number;
    recommendation: string;
  };
  createdAt: string;
}
