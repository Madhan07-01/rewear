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
  ProductCondition,
  ReVivePartner,
  ReViveRequest,
  ReViveLiveActivity,
  ReViveMetrics
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  INITIAL_DEPOSITS,
  INITIAL_DISPUTES,
  INITIAL_POLICY,
  INITIAL_AUDIT_LOGS,
  INITIAL_REVIVE_PARTNERS,
  INITIAL_REVIVE_REQUESTS,
  INITIAL_REVIVE_ACTIVITIES,
  INITIAL_REVIVE_METRICS
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
  private revivePartners: ReVivePartner[] = [];
  private reviveRequests: ReViveRequest[] = [];
  private reviveActivities: ReViveLiveActivity[] = [];
  private reviveMetrics: ReViveMetrics = { ...INITIAL_REVIVE_METRICS };

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
    this.revivePartners = JSON.parse(JSON.stringify(INITIAL_REVIVE_PARTNERS));
    this.reviveRequests = JSON.parse(JSON.stringify(INITIAL_REVIVE_REQUESTS));
    this.reviveActivities = JSON.parse(JSON.stringify(INITIAL_REVIVE_ACTIVITIES));
    this.reviveMetrics = JSON.parse(JSON.stringify(INITIAL_REVIVE_METRICS));
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

  // --- ReVive Circular Next-Life Platform ---
  public getReVivePartners(type?: string, city?: string): ReVivePartner[] {
    return this.revivePartners.filter(p => {
      if (type && type !== 'ALL' && p.partnerType !== type) return false;
      if (city && p.city.toLowerCase() !== city.toLowerCase()) return false;
      return true;
    });
  }

  public getReVivePartnerById(id: string): ReVivePartner | undefined {
    return this.revivePartners.find(p => p.id === id);
  }

  public getReViveRequests(sellerId?: string): ReViveRequest[] {
    if (sellerId) {
      return this.reviveRequests.filter(r => r.sellerId === sellerId);
    }
    return this.reviveRequests;
  }

  public getReViveRequestById(id: string): ReViveRequest | undefined {
    return this.reviveRequests.find(r => r.id === id);
  }

  public createReViveRequest(data: Partial<ReViveRequest>): ReViveRequest {
    const id = `rev_req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const product = this.getProductById(data.productId || '');
    if (!product) throw new Error('Product not found for ReVive request');

    const partner = data.partnerId ? this.getReVivePartnerById(data.partnerId) : undefined;

    const newReq: ReViveRequest = {
      id,
      productId: product.id,
      productTitle: product.title,
      productCode: product.productCode,
      productImage: product.images[0] || '',
      sellerId: data.sellerId || product.sellerId,
      sellerName: data.sellerName || product.sellerName,
      route: data.route || 'DONATE',
      status: data.status || 'ASSESSMENT_PENDING',
      partnerId: partner?.id,
      partnerName: partner?.name,
      partnerType: partner?.partnerType,
      scheduledAt: data.scheduledAt || new Date(Date.now() + 86400000).toISOString(),
      handoverMethod: data.handoverMethod || 'PICKUP',
      weightKg: data.weightKg || product.estimatedWeightKg || 1.0,
      recyclerPayoutEstimate: data.recyclerPayoutEstimate,
      repairCostEstimate: data.repairCostEstimate,
      repairDescription: data.repairDescription,
      condition: data.condition || product.condition,
      notes: data.notes || '',
      evidencePhotos: data.evidencePhotos || product.images,
      qrCode: `REVIVE-${data.route}-${product.productCode}-${Math.floor(100000 + Math.random() * 900000)}`,
      otp: `${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };

    this.reviveRequests.unshift(newReq);

    // Update product lifecycle status
    if (newReq.route === 'DONATE') {
      product.lifecycleStatus = 'DONATION_SCHEDULED';
      product.recommendedNextLife = 'DONATE';
    } else if (newReq.route === 'RECYCLE') {
      product.lifecycleStatus = 'RECYCLING_SCHEDULED';
      product.recommendedNextLife = 'RECYCLE';
      this.reviveMetrics.recyclingRequestsActive += 1;
    } else if (newReq.route === 'UPCYCLE') {
      product.lifecycleStatus = 'UPCYCLING_PENDING';
      product.recommendedNextLife = 'UPCYCLE';
    } else if (newReq.route === 'REPAIR') {
      product.lifecycleStatus = 'IN_REPAIR';
      product.recommendedNextLife = 'REPAIR';
    } else if (newReq.route === 'RETIRE') {
      product.lifecycleStatus = 'RESPONSIBLE_DISPOSAL_PENDING';
      product.recommendedNextLife = 'RETIRE';
    }

    this.addAuditLog(
      'REVIVE_REQUEST_CREATED',
      'REVIVE',
      newReq.id,
      newReq.sellerName,
      `ReVive request submitted for ${product.title} (${product.productCode}) under route: ${newReq.route}. Partner: ${partner?.name || 'Pending assignment'}.`
    );

    return newReq;
  }

  public updateReViveRequest(id: string, updates: Partial<ReViveRequest>): ReViveRequest {
    const req = this.getReViveRequestById(id);
    if (!req) throw new Error('ReVive request not found');

    Object.assign(req, updates);

    this.addAuditLog(
      'REVIVE_REQUEST_UPDATED',
      'REVIVE',
      req.id,
      req.sellerName,
      `ReVive request ${req.id} updated to status ${req.status}.`
    );

    return req;
  }

  public confirmReViveOutcome(
    id: string,
    outcome: {
      finalWeightKg?: number;
      finalPayout?: number;
      receiptId?: string;
      certificateId?: string;
      relistCondition?: ProductCondition;
      relistPrice?: number;
      notes?: string;
    }
  ): { request: ReViveRequest; product: Product } {
    const req = this.getReViveRequestById(id);
    if (!req) throw new Error('ReVive request not found');

    const product = this.getProductById(req.productId);
    if (!product) throw new Error('Product not found for ReVive confirmation');

    const now = new Date().toISOString();
    const dateFormatted = now.split('T')[0];

    req.completedAt = now;
    if (outcome.notes) req.notes = `${req.notes ? req.notes + ' · ' : ''}${outcome.notes}`;

    if (req.route === 'DONATE') {
      req.status = 'DONATED';
      req.receiptId = outcome.receiptId || `DON-REC-${Math.floor(1000 + Math.random() * 9000)}`;
      product.lifecycleStatus = 'DONATED';
      this.reviveMetrics.donationsCompleted += 1;
      this.reviveMetrics.textileDivertedKg += (req.weightKg || 1.0);
      this.reviveMetrics.communityReuseEvents += 1;

      product.passportEvents.push({
        id: `evt_rev_${Date.now()}`,
        date: dateFormatted,
        eventType: 'REVIVE_DONATED',
        title: 'Donated for Community Reuse',
        description: `Delivered to verified partner ${req.partnerName || 'Community Trust'}. Receipt: ${req.receiptId}. Renter acknowledged with warm thanks.`,
        reviveDetails: {
          route: 'DONATE',
          partnerName: req.partnerName,
          partnerType: req.partnerType,
          receiptId: req.receiptId,
          weightKg: req.weightKg
        }
      });

      this.addReViveActivity({
        id: `act_${Date.now()}`,
        type: 'DONATION',
        productTitle: product.title,
        productCode: product.productCode,
        partnerName: req.partnerName || 'Community Partner',
        statusText: `Your item was successfully donated to ${req.partnerName}.`,
        badgeText: 'Donated',
        badgeColor: 'emerald',
        timeAgo: 'Just now',
        details: `Receipt #${req.receiptId} confirmed. Garment gifted for community empowerment.`,
        ctaText: 'View Receipt'
      });
    } else if (req.route === 'RECYCLE') {
      req.status = 'RECYCLED';
      req.weightKg = outcome.finalWeightKg || req.weightKg || 1.2;
      req.recyclerFinalPayout = outcome.finalPayout !== undefined ? outcome.finalPayout : (req.recyclerPayoutEstimate || 36);
      req.receiptId = outcome.receiptId || `RWH-REC-${Math.floor(1000 + Math.random() * 9000)}`;
      req.certificateId = outcome.certificateId || `CERT-ECO-${Math.floor(1000 + Math.random() * 9000)}`;
      product.lifecycleStatus = 'RECYCLED';

      this.reviveMetrics.recyclingRequestsActive = Math.max(0, this.reviveMetrics.recyclingRequestsActive - 1);
      this.reviveMetrics.recyclerEarnings += req.recyclerFinalPayout;
      this.reviveMetrics.textileDivertedKg += req.weightKg;

      product.passportEvents.push({
        id: `evt_rev_${Date.now()}`,
        date: dateFormatted,
        eventType: 'REVIVE_RECYCLED',
        title: 'Textile Material Recovery Confirmed',
        description: `Verified weight: ${req.weightKg} kg. Certificate: ${req.certificateId}. Mock recycler payout of ₹${req.recyclerFinalPayout} recorded.`,
        reviveDetails: {
          route: 'RECYCLE',
          partnerName: req.partnerName,
          partnerType: 'RECYCLING_HUB',
          weightKg: req.weightKg,
          payoutAmount: req.recyclerFinalPayout,
          receiptId: req.receiptId
        }
      });

      this.addReViveActivity({
        id: `act_${Date.now()}`,
        type: 'RECYCLING',
        productTitle: product.title,
        productCode: product.productCode,
        partnerName: req.partnerName || 'EcoTex Hub',
        statusText: `Mock recycler payout of ₹${req.recyclerFinalPayout} recorded.`,
        badgeText: `₹${req.recyclerFinalPayout} Earned`,
        badgeColor: 'emerald',
        timeAgo: 'Just now',
        details: `${req.weightKg} kg fibers recovered. Certificate #${req.certificateId}.`,
        ctaText: 'View Certificate'
      });
    } else if (req.route === 'UPCYCLE') {
      req.status = 'UPCYCLED';
      product.lifecycleStatus = 'UPCYCLED';
      this.reviveMetrics.garmentsUpcycled += 1;
      this.reviveMetrics.textileDivertedKg += (req.weightKg || 1.5);

      product.passportEvents.push({
        id: `evt_rev_${Date.now()}`,
        date: dateFormatted,
        eventType: 'REVIVE_UPCYCLED',
        title: 'Upcycled into Heirloom Accessories',
        description: `Transformed by ${req.partnerName || 'Upcycling Atelier'} into artisanal accessories and home decor. Zero waste achieved.`,
        reviveDetails: {
          route: 'UPCYCLE',
          partnerName: req.partnerName,
          partnerType: 'UPCYCLE_STUDIO',
          weightKg: req.weightKg
        }
      });

      this.addReViveActivity({
        id: `act_${Date.now()}`,
        type: 'UPCYCLING',
        productTitle: product.title,
        productCode: product.productCode,
        partnerName: req.partnerName || 'Heritage Atelier',
        statusText: `Your upcycling request completed: handcrafted potlis created.`,
        badgeText: 'Upcycled',
        badgeColor: 'purple',
        timeAgo: 'Just now',
        details: 'Heirloom brocade converted into 6 artisanal potli clutches.',
        ctaText: 'View Craft Story'
      });
    } else if (req.route === 'REPAIR') {
      req.status = 'RELISTED';
      product.lifecycleStatus = 'AVAILABLE';
      product.condition = outcome.relistCondition || 'Good';
      product.repairsCount = (product.repairsCount || 0) + 1;
      if (outcome.relistPrice) product.rentalPrice3Days = outcome.relistPrice;
      this.reviveMetrics.repairsRelisted += 1;

      product.passportEvents.push({
        id: `evt_rev_${Date.now()}`,
        date: dateFormatted,
        eventType: 'REVIVE_REPAIRED_RELISTED',
        title: 'Repaired & Relisted for Next Life',
        description: `Restored by master tailor. Seams reinforced and dry-cleaned. Returned to active circular inventory in ${product.condition} condition.`,
        reviveDetails: {
          route: 'REPAIR',
          repairCost: req.repairCostEstimate || 250
        }
      });

      this.addReViveActivity({
        id: `act_${Date.now()}`,
        type: 'REPAIR',
        productTitle: product.title,
        productCode: product.productCode,
        partnerName: 'Master Darzi Atelier',
        statusText: `Your ${product.title} was repaired and relisted to your wardrobe.`,
        badgeText: 'Relisted',
        badgeColor: 'blue',
        timeAgo: 'Just now',
        details: `Condition upgraded to ${product.condition}. Live in wardrobe catalog.`,
        ctaText: 'View Listing'
      });
    } else if (req.route === 'RETIRE') {
      req.status = 'RETIRED';
      product.lifecycleStatus = 'RETIRED';

      product.passportEvents.push({
        id: `evt_rev_${Date.now()}`,
        date: dateFormatted,
        eventType: 'REVIVE_RETIRED',
        title: 'Responsible End-of-Life Retirement',
        description: `Garment honorably retired after ${product.usageCount} circular wears. Eco-safe materials segregated.`,
        reviveDetails: {
          route: 'RETIRE'
        }
      });
    }

    this.addAuditLog(
      'REVIVE_OUTCOME_CONFIRMED',
      'REVIVE',
      req.id,
      req.sellerName,
      `ReVive outcome confirmed for ${product.title} (${product.productCode}) under route: ${req.route}. Status: ${req.status}.`
    );

    return { request: req, product };
  }

  public getReViveMetrics(sellerId?: string): ReViveMetrics {
    const productsNeedingAction = this.products.filter(p => {
      if (sellerId && p.sellerId !== sellerId) return false;
      return (
        p.condition === 'Fair' ||
        p.condition === 'Damaged' ||
        p.condition === 'Minor damage' ||
        p.condition === 'Major damage' ||
        p.lifecycleStatus === 'INSPECTION_PENDING' ||
        p.lifecycleStatus === 'IN_REPAIR' ||
        p.lifecycleStatus === 'DONATION_PENDING' ||
        p.lifecycleStatus === 'RECYCLER_QUOTE_RECEIVED' ||
        p.lifecycleStatus === 'UPCYCLING_PENDING'
      );
    });

    return {
      ...this.reviveMetrics,
      itemsNeedingAction: productsNeedingAction.length
    };
  }

  public getReViveActivities(): ReViveLiveActivity[] {
    return this.reviveActivities;
  }

  public addReViveActivity(activity: ReViveLiveActivity) {
    this.reviveActivities.unshift(activity);
    if (this.reviveActivities.length > 20) {
      this.reviveActivities.pop();
    }
  }
}

export const store = new DataStore();

