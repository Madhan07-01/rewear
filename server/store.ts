import {
  Product,
  User,
  Order,
  DepositRecord,
  DisputeCase,
  AuditLogEntry,
  PolicyConfig,
  TryOnJob,
  OrderStatus,
  DepositStatus,
  ProductCondition
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_DEPOSITS,
  INITIAL_DISPUTES,
  INITIAL_POLICY,
  INITIAL_AUDIT_LOGS
} from './data';

class DataStore {
  private users: User[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private deposits: DepositRecord[] = [];
  private disputes: DisputeCase[] = [];
  private policy: PolicyConfig = { ...INITIAL_POLICY };
  private auditLogs: AuditLogEntry[] = [];
  private tryOnJobs: Map<string, TryOnJob> = new Map();

  constructor() {
    this.reset();
  }

  public reset() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.deposits = JSON.parse(JSON.stringify(INITIAL_DEPOSITS));
    this.disputes = JSON.parse(JSON.stringify(INITIAL_DISPUTES));
    this.policy = JSON.parse(JSON.stringify(INITIAL_POLICY));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.tryOnJobs.clear();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates);
    return user;
  }

  // --- Products ---
  public getProducts(filters?: {
    category?: string;
    occasion?: string;
    styleMood?: string;
    size?: string;
    maxBudget?: number;
    city?: string;
    search?: string;
    premiumOnly?: boolean;
    sellerId?: string;
    includeRetired?: boolean;
  }): Product[] {
    return this.products.filter(p => {
      if (!filters?.includeRetired && p.lifecycleStatus === 'RETIRED') {
        return false;
      }
      if (filters?.sellerId && p.sellerId !== filters.sellerId) {
        return false;
      }
      if (filters?.category && filters.category !== 'All' && p.category !== filters.category) {
        return false;
      }
      if (filters?.occasion && filters.occasion !== 'All') {
        const matchesOccasion = p.occasion.some(o => o.toLowerCase().includes(filters.occasion!.toLowerCase()));
        if (!matchesOccasion) return false;
      }
      if (filters?.styleMood && filters.styleMood !== 'All') {
        const matchesStyle = p.styleMood.some(s => s.toLowerCase() === filters.styleMood!.toLowerCase());
        if (!matchesStyle) return false;
      }
      if (filters?.size && filters.size !== 'All') {
        if (p.sizeLabel !== filters.size && p.sizeLabel !== 'Free Size') return false;
      }
      if (filters?.maxBudget && filters.maxBudget > 0) {
        if (p.rentalPrice3Days > filters.maxBudget) return false;
      }
      if (filters?.city && filters.city !== 'All') {
        if (p.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      }
      if (filters?.premiumOnly) {
        if (p.premiumTier === 'STANDARD') return false;
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const haystack = `${p.title} ${p.category} ${p.brand} ${p.colour} ${p.fabric} ${p.description} ${p.locality}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public createProduct(data: Omit<Product, 'id' | 'usageCount' | 'usageDays' | 'repairsCount' | 'passportEvents'>): Product {
    const id = `prod_${Date.now()}`;
    const product: Product = {
      ...data,
      id,
      usageCount: 0,
      usageDays: 0,
      repairsCount: 0,
      passportEvents: [
        {
          id: `evt_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          eventType: 'ACQUISITION',
          title: 'Added to ReWear Circular Wardrobe',
          description: `Initial condition certified as ${data.condition}. Stored in ${data.locality}.`
        }
      ]
    };
    this.products.unshift(product);
    this.addAuditLog('PRODUCT_CREATED', 'PRODUCT', id, data.sellerId, `Product ${data.productCode} (${data.title}) listed.`);
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const prod = this.getProductById(id);
    if (!prod) return undefined;
    Object.assign(prod, updates);
    return prod;
  }

  public retireProduct(id: string, actorId: string, reason: string): Product | undefined {
    const prod = this.getProductById(id);
    if (!prod) return undefined;
    prod.lifecycleStatus = 'RETIRED';
    prod.passportEvents.push({
      id: `evt_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      eventType: 'CONDITION_UPDATE',
      title: 'Garment Retired from Circulation',
      description: `Retired under circular lifecycle policy. Reason: ${reason}`
    });
    this.addAuditLog('PRODUCT_RETIRED', 'PRODUCT', id, actorId, `Product ${prod.productCode} retired. Reason: ${reason}`);
    return prod;
  }

  // --- Orders ---
  public getOrders(userId?: string, role?: string): Order[] {
    if (!userId) return this.orders;
    if (role === 'CUSTOMER') {
      return this.orders.filter(o => o.customerId === userId);
    }
    if (role === 'B2C_SELLER' || role === 'B2B_SELLER') {
      return this.orders.filter(o => o.sellerId === userId);
    }
    return this.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  public createOrder(params: {
    productId: string;
    customerId: string;
    customerName: string;
    startDate: string;
    endDate: string;
    rentalDays: number;
    fulfilmentMethod: 'PICKUP' | 'DELIVERY';
    deliveryAddress?: string;
    protectionPlanSelected: boolean;
  }): Order {
    const product = this.getProductById(params.productId);
    if (!product) throw new Error('Product not found');

    const rentalAmount = product.rentalPrice3Days;
    const refundableDeposit = product.refundableDeposit;
    const deliveryCharge = params.fulfilmentMethod === 'DELIVERY' ? product.deliveryCharge : 0;
    const protectionAmount = params.protectionPlanSelected ? product.protectionPrice : 0;
    const platformFee = 49;
    const totalPaidToday = rentalAmount + refundableDeposit + deliveryCharge + protectionAmount + platformFee;

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `REW-${Math.floor(10000 + Math.random() * 90000)}`;
    const pickupOtp = String(Math.floor(100000 + Math.random() * 900000));
    const returnOtp = String(Math.floor(100000 + Math.random() * 900000));

    const order: Order = {
      id: orderId,
      orderNumber,
      productId: product.id,
      productTitle: product.title,
      productCode: product.productCode,
      productImage: product.images[0],
      customerId: params.customerId,
      customerName: params.customerName,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      status: 'CONFIRMED', // Paid and confirmed in our streamlined checkout
      startDate: params.startDate,
      endDate: params.endDate,
      rentalDays: params.rentalDays,
      fulfilmentMethod: params.fulfilmentMethod,
      deliveryAddress: params.deliveryAddress || (params.fulfilmentMethod === 'PICKUP' ? `${product.locality} Hub` : undefined),
      pickupOtp,
      pickupQrCode: `REW-PICKUP-${orderNumber}-${pickupOtp}`,
      returnOtp,
      returnQrCode: `REW-RETURN-${orderNumber}-${returnOtp}`,
      pricing: {
        rentalAmount,
        refundableDeposit,
        deliveryCharge,
        protectionAmount,
        platformFee,
        totalPaidToday
      },
      protectionPlanSelected: params.protectionPlanSelected,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(order);

    // Create Escrow Deposit Record (held separately from platform revenue)
    const depositId = `dep_${Date.now()}`;
    const depositRecord: DepositRecord = {
      id: depositId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: refundableDeposit,
      status: 'HELD',
      heldAt: new Date().toISOString()
    };
    this.deposits.unshift(depositRecord);

    // Update Product status
    product.lifecycleStatus = 'RESERVED';

    this.addAuditLog(
      'ORDER_CREATED_AND_PAID',
      'ORDER',
      order.id,
      params.customerId,
      `Order ${orderNumber} reserved. Total: ₹${totalPaidToday}. Escrow Deposit: ₹${refundableDeposit}.`
    );

    return order;
  }

  public handoverOrder(orderId: string, params: {
    verifiedMethod: 'QR' | 'OTP';
    frontPhoto: string;
    detailPhoto: string;
    conditionConfirmed: string;
    notes?: string;
  }): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'ACTIVE_RENTAL';
    order.handoverEvidence = {
      verifiedAt: new Date().toISOString(),
      verifiedMethod: params.verifiedMethod,
      frontPhoto: params.frontPhoto,
      detailPhoto: params.detailPhoto,
      conditionConfirmed: params.conditionConfirmed,
      notes: params.notes
    };
    order.updatedAt = new Date().toISOString();

    const product = this.getProductById(order.productId);
    if (product) {
      product.lifecycleStatus = 'RENTED';
    }

    this.addAuditLog(
      'ORDER_HANDOVER_VERIFIED',
      'ORDER',
      order.id,
      order.sellerId,
      `Handover verified via ${params.verifiedMethod}. Condition: "${params.conditionConfirmed}". Status -> ACTIVE_RENTAL.`
    );

    return order;
  }

  public returnOrder(orderId: string, params: {
    returnMethod: 'PICKUP' | 'DELIVERY';
    returnPhotos: string[];
    customerNotes?: string;
  }): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'INSPECTION_PENDING';
    order.returnEvidence = {
      returnedAt: new Date().toISOString(),
      returnMethod: params.returnMethod,
      returnPhotos: params.returnPhotos,
      customerNotes: params.customerNotes
    };
    order.updatedAt = new Date().toISOString();

    const product = this.getProductById(order.productId);
    if (product) {
      product.lifecycleStatus = 'INSPECTION';
    }

    this.addAuditLog(
      'ORDER_RETURN_INITIATED',
      'ORDER',
      order.id,
      order.customerId,
      `Order ${order.orderNumber} handed back by customer. Photos uploaded. Inspection pending.`
    );

    return order;
  }

  public inspectOrder(orderId: string, params: {
    conditionScore: ProductCondition;
    depositOutcome: 'FULL_REFUND' | 'PARTIAL_DEDUCTION' | 'DISPUTED';
    deductionAmount?: number;
    deductionReason?: string;
    repairEstimate?: string;
    evidencePhotos?: string[];
  }): { order: Order; deposit: DepositRecord } {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const deposit = this.deposits.find(d => d.orderId === orderId);
    if (!deposit) throw new Error('Deposit record not found');

    const product = this.getProductById(order.productId);

    order.inspection = {
      inspectedAt: new Date().toISOString(),
      conditionScore: params.conditionScore,
      depositOutcome: params.depositOutcome,
      deductionAmount: params.deductionAmount,
      deductionReason: params.deductionReason,
      repairEstimate: params.repairEstimate,
      evidencePhotos: params.evidencePhotos
    };

    if (params.depositOutcome === 'FULL_REFUND') {
      order.status = 'COMPLETED';
      deposit.status = 'REFUNDED';
      deposit.eligibleAt = new Date().toISOString();
      deposit.refundedAt = new Date().toISOString();
      deposit.refundTransactionId = `TXN_REF_${Math.floor(10000000 + Math.random() * 90000000)}`;

      if (product) {
        product.lifecycleStatus = 'AVAILABLE';
        product.usageCount += 1;
        product.usageDays += order.rentalDays || 3;
        product.passportEvents.push({
          id: `evt_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          eventType: 'RENTAL_COMPLETED',
          title: `Rental #${product.usageCount} Completed Flawlessly`,
          description: `Worn by ${order.customerName} for ${order.rentalDays} days. Returned in ${params.conditionScore} condition. Full deposit refunded.`,
          ecoImpact: {
            co2SavedKg: 14.8,
            waterSavedLiters: 920
          }
        });
      }

      this.addAuditLog(
        'INSPECTION_PASSED_FULL_REFUND',
        'DEPOSIT',
        deposit.id,
        order.sellerId,
        `Inspection approved for ${order.orderNumber}. Full deposit ₹${deposit.amount} refunded to customer.`
      );
    } else if (params.depositOutcome === 'PARTIAL_DEDUCTION') {
      order.status = 'COMPLETED';
      deposit.status = 'PARTIALLY_DEDUCTED';
      deposit.deductionAmount = params.deductionAmount || 0;
      deposit.deductionReason = params.deductionReason;
      deposit.deductionEvidence = params.evidencePhotos;
      deposit.refundedAt = new Date().toISOString();
      deposit.refundTransactionId = `TXN_REF_PARTIAL_${Math.floor(100000 + Math.random() * 900000)}`;

      if (product) {
        product.lifecycleStatus = 'AVAILABLE';
        product.usageCount += 1;
        product.repairsCount += 1;
        product.passportEvents.push({
          id: `evt_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          eventType: 'REPAIR',
          title: 'Minor Restoration Scheduled',
          description: `Inspection noted: ${params.deductionReason}. Deducted ₹${params.deductionAmount} for repair.`
        });
      }

      this.addAuditLog(
        'INSPECTION_PARTIAL_DEDUCTION',
        'DEPOSIT',
        deposit.id,
        order.sellerId,
        `Inspection deduction ₹${params.deductionAmount} for ${order.orderNumber}. Reason: ${params.deductionReason}.`
      );
    } else {
      // Disputed
      order.status = 'DISPUTED';
      deposit.status = 'DISPUTED';

      const disputeId = `disp_${Date.now()}`;
      const disputeCase: DisputeCase = {
        id: disputeId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        raisedBy: 'SELLER',
        claimantName: order.sellerName,
        reason: params.deductionReason || 'Condition dispute after return',
        amountDisputed: params.deductionAmount || deposit.amount,
        status: 'OPEN',
        evidenceUrls: params.evidencePhotos || [],
        timeline: [
          {
            date: new Date().toISOString(),
            actor: order.sellerName,
            message: `Seller claimed damage of ₹${params.deductionAmount || deposit.amount}: "${params.deductionReason}". Case queued for Admin review.`
          }
        ]
      };
      this.disputes.unshift(disputeCase);

      this.addAuditLog(
        'DISPUTE_ESCALATED',
        'DISPUTE',
        disputeId,
        order.sellerId,
        `Dispute opened for order ${order.orderNumber}. ₹${disputeCase.amountDisputed} held in dispute.`
      );
    }

    order.updatedAt = new Date().toISOString();
    return { order, deposit };
  }

  // --- Deposits & Disputes ---
  public getDeposits(): DepositRecord[] {
    return this.deposits;
  }

  public getDepositById(id: string): DepositRecord | undefined {
    return this.deposits.find(d => d.id === id);
  }

  public getDisputes(): DisputeCase[] {
    return this.disputes;
  }

  public resolveDispute(disputeId: string, outcome: 'FULL_REFUND' | 'PARTIAL_DEDUCTION' | 'FULL_DEDUCTION', notes: string, actor: string): DisputeCase {
    const dispute = this.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error('Dispute not found');

    const deposit = this.deposits.find(d => d.orderId === dispute.orderId);
    const order = this.getOrderById(dispute.orderId);

    dispute.status = 'RESOLVED';
    dispute.resolutionNotes = notes;
    dispute.resolvedAt = new Date().toISOString();
    dispute.timeline.push({
      date: new Date().toISOString(),
      actor,
      message: `Admin resolved dispute with ${outcome}. Notes: ${notes}`
    });

    if (deposit) {
      deposit.status = outcome === 'FULL_REFUND' ? 'REFUNDED' : outcome === 'PARTIAL_DEDUCTION' ? 'PARTIALLY_DEDUCTED' : 'FULLY_DEDUCTED';
    }
    if (order) {
      order.status = 'COMPLETED';
    }

    this.addAuditLog('DISPUTE_RESOLVED', 'DISPUTE', disputeId, actor, `Dispute ${disputeId} resolved as ${outcome}.`);
    return dispute;
  }

  // --- Policy & Audit ---
  public getPolicy(): PolicyConfig {
    return this.policy;
  }

  public updatePolicy(updates: Partial<PolicyConfig>, actor: string): PolicyConfig {
    Object.assign(this.policy, updates);
    this.addAuditLog('POLICY_UPDATED', 'POLICY', 'platform_policy', actor, `Platform policies updated.`);
    return this.policy;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  private addAuditLog(eventType: string, entityType: AuditLogEntry['entityType'], entityId: string, actor: string, details: string) {
    this.auditLogs.unshift({
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      eventType,
      entityType,
      entityId,
      actor,
      details
    });
  }

  // --- Try-On Jobs ---
  public createTryOnJob(job: TryOnJob) {
    this.tryOnJobs.set(job.id, job);
  }

  public getTryOnJob(id: string): TryOnJob | undefined {
    return this.tryOnJobs.get(id);
  }
}

export const store = new DataStore();
