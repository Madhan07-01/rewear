export type UserRole = 'CUSTOMER' | 'B2C_SELLER' | 'B2B_SELLER' | 'ADMIN';

export type ProductCondition = 'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged' | 'Minor damage' | 'Major damage' | 'Retired';

export type ProductLifecycleStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'RENTED'
  | 'RETURNED'
  | 'INSPECTION'
  | 'INSPECTION_PENDING'
  | 'REPAIR'
  | 'IN_REPAIR'
  | 'RELISTED'
  | 'DONATION_PENDING'
  | 'DONATION_SCHEDULED'
  | 'DONATED'
  | 'UPCYCLING_PENDING'
  | 'UPCYCLED'
  | 'RECYCLER_QUOTE_REQUESTED'
  | 'RECYCLER_QUOTE_RECEIVED'
  | 'RECYCLER_QUOTE_ACCEPTED'
  | 'RECYCLING_SCHEDULED'
  | 'RECYCLING_PENDING'
  | 'RECYCLED'
  | 'RESPONSIBLE_DISPOSAL_PENDING'
  | 'RESPONSIBLE_DISPOSAL'
  | 'RETIRED';

export type OrderStatus =
  | 'DRAFT'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'SELLER_CONFIRMATION_PENDING'
  | 'CONFIRMED'
  | 'FULFILMENT_PENDING'
  | 'PICKUP_READY'
  | 'DELIVERY_PICKUP_PENDING'
  | 'PICKED_UP_BY_COURIER'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'HANDOVER_VERIFICATION_PENDING'
  | 'HANDED_OVER'
  | 'DELIVERED'
  | 'ACTIVE_RENTAL'
  | 'RETURN_PENDING'
  | 'RETURN_SCHEDULED'
  | 'RETURN_HANDOVER_VERIFICATION_PENDING'
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
  bust: number;
  waist: number;
  hip: number;
  shoulder?: number;
  length: number;
  stretchLevel: 'None' | 'Low' | 'Medium' | 'High';
}

export interface UserMeasurements {
  bust: number;
  waist: number;
  hip: number;
  height: number;
  preferredFit: 'fitted' | 'regular' | 'relaxed' | 'oversized';
}

export interface LifecycleEvent {
  id: string;
  date: string;
  eventType:
    | 'ACQUISITION'
    | 'RENTAL_COMPLETED'
    | 'DRY_CLEAN'
    | 'REPAIR'
    | 'INSPECTION_PASSED'
    | 'CONDITION_UPDATE'
    | 'REVIVE_REPAIRED_RELISTED'
    | 'REVIVE_DONATION_SCHEDULED'
    | 'REVIVE_DONATED'
    | 'REVIVE_RECYCLER_QUOTE'
    | 'REVIVE_RECYCLED'
    | 'REVIVE_UPCYCLED'
    | 'REVIVE_RETIRED';
  title: string;
  description: string;
  location?: string;
  ecoImpact?: {
    co2SavedKg: number;
    waterSavedLiters: number;
  };
  reviveDetails?: {
    route?: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE';
    partnerName?: string;
    partnerType?: string;
    weightKg?: number;
    payoutAmount?: number;
    receiptId?: string;
    repairCost?: number;
  };
}

export interface Product {
  id: string;
  productCode: string;
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
  estimatedWeightKg?: number;
  recommendedNextLife?: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE';
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

export type HandoverType =
  | 'PICKUP_OUTBOUND'
  | 'DELIVERY_OUTBOUND'
  | 'RETURN_INBOUND'
  | 'PARTNER_HUB_HANDOVER'
  | 'SELLER_DIRECT_HANDOVER';

export type HandoverStatus =
  | 'PENDING'
  | 'SCAN_VERIFIED'
  | 'OTP_VERIFIED'
  | 'COMPLETED'
  | 'REFUSED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface HandoverSession {
  id: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productImage: string;
  handoverType: HandoverType;
  fulfilmentMethod: 'PICKUP' | 'DELIVERY';
  direction: 'OUTBOUND' | 'RETURN';
  senderUserId: string;
  receiverUserId: string;
  sellerId: string;
  assignedPartnerId?: string;
  status: HandoverStatus;
  scheduledAt: string;
  verificationWindowStart: string;
  verificationWindowEnd: string;
  completedAt?: string;
  cancelledAt?: string;
  rescheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  isHighValue: boolean;
  qrTokenHash: string;
  qrExpiresAt: string;
  qrUsedAt?: string;
  otpHashed: string;
  otpExpiresAt: string;
  otpUsedAt?: string;
  otpFailedAttempts: number;
  otpLockedUntil?: string;
  checklist?: {
    correctItem: boolean;
    correctSize: boolean;
    cleanAndReady: boolean;
    zipperButtonsWorking: boolean;
    accessoriesIncluded: boolean;
    conditionMatchesListing: boolean;
    returnInstructionsGiven: boolean;
  };
  evidencePhotos: string[];
  customerConfirmed: boolean;
  customerConfirmedAt?: string;
  sellerConfirmed: boolean;
  sellerConfirmedAt?: string;
  refusalReason?: string;
  notes?: string;
  deliveryProof?: {
    deliveredAt: string;
    courierName: string;
    signatureReceived: boolean;
    photoUrl?: string;
  };
}

export interface HandoverPass {
  handoverId: string;
  orderId: string;
  orderNumber: string;
  handoverType: HandoverType;
  qrToken: string;
  qrExpiresAt: string;
  formattedOtp: string;
  otpExpiresAt: string;
  remainingSeconds: number;
  instructions: string;
  scheduledAt: string;
  locality: string;
  exactAddress?: string;
  sellerName: string;
  isHighValue: boolean;
  status: HandoverStatus;
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
  outboundHandoverId?: string;
  returnHandoverId?: string;
  rentalStartedAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
  inspectionDueAt?: string;
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

export interface RecommendationMatchResult {
  product: Product;
  matchScorePercent: number;
  fitConfidence: 'High' | 'Medium' | 'Low';
  fitMode: FitMode;
  reasons: string[];
  distanceKm: number;
  isBestMatch?: boolean;
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
  entityType: 'ORDER' | 'DEPOSIT' | 'PRODUCT' | 'USER' | 'POLICY' | 'DISPUTE' | 'HANDOVER' | 'REVIVE';
  entityId: string;
  actor: string;
  details: string;
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

export interface ReVivePartner {
  id: string;
  name: string;
  partnerType: 'DONATION_NGO' | 'COLLEGE_CLOSET' | 'COMMUNITY_WARDROBE' | 'RECYCLING_HUB' | 'UPCYCLE_STUDIO' | 'DISASTER_RELIEF';
  verified: boolean;
  city: string;
  locality: string;
  approxDistanceKm: number;
  pickupSupported: boolean;
  dropoffSupported: boolean;
  acceptedCategories: string[];
  acceptedConditions: string[];
  hygieneRequirements: string;
  receiptProvided: boolean;
  ratePerKgRange?: { min: number; max: number };
  upcycleOffer?: string;
  active: boolean;
  address: string;
  description: string;
}

export interface ReViveRequest {
  id: string;
  productId: string;
  productTitle: string;
  productCode: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  route: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE';
  status:
    | 'DRAFT'
    | 'ASSESSMENT_PENDING'
    | 'PARTNER_SELECTED'
    | 'DONATION_SCHEDULED'
    | 'HANDOVER_PENDING'
    | 'HANDOVER_VERIFIED'
    | 'DONATED'
    | 'QUOTE_REQUESTED'
    | 'QUOTE_RECEIVED'
    | 'QUOTE_ACCEPTED'
    | 'RECYCLING_SCHEDULED'
    | 'RECYCLER_RECEIVED'
    | 'FINAL_WEIGHT_VERIFIED'
    | 'PAYOUT_RECORDED'
    | 'RECYCLED'
    | 'UPCYCLING_PENDING'
    | 'UPCYCLED'
    | 'REPAIR_IN_PROGRESS'
    | 'REPAIR_COMPLETED'
    | 'RELISTED'
    | 'RETIRED'
    | 'CANCELLED';
  partnerId?: string;
  partnerName?: string;
  partnerType?: string;
  scheduledAt?: string;
  handoverMethod?: 'PICKUP' | 'DROPOFF';
  weightKg?: number;
  recyclerPayoutEstimate?: number;
  recyclerFinalPayout?: number;
  repairCostEstimate?: number;
  repairDescription?: string;
  condition: string;
  notes?: string;
  evidencePhotos: string[];
  qrCode?: string;
  otp?: string;
  receiptId?: string;
  certificateId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReViveMetrics {
  itemsNeedingAction: number;
  donationsCompleted: number;
  recyclingRequestsActive: number;
  recyclerEarnings: number;
  repairsRelisted: number;
  garmentsUpcycled: number;
  textileDivertedKg: number;
  communityReuseEvents: number;
}

export interface ReViveLiveActivity {
  id: string;
  type: 'DONATION' | 'RECYCLING' | 'UPCYCLING' | 'REPAIR';
  productTitle: string;
  productCode: string;
  partnerName: string;
  statusText: string;
  badgeText: string;
  badgeColor: 'amber' | 'emerald' | 'blue' | 'purple';
  timeAgo: string;
  details: string;
  ctaText: string;
}
