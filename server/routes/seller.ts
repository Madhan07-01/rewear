import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.get('/dashboard', (req, res) => {
  const sellerId = (req.headers['x-user-id'] as string) || 'usr_kavita_b2c';
  const products = store.getProducts({ sellerId, includeRetired: true });
  const allOrders = store.getOrders();
  const sellerOrders = allOrders.filter(o => o.sellerId === sellerId);

  // Financial calculations
  const completedOrders = sellerOrders.filter(o => o.status === 'COMPLETED');
  const activeRentals = sellerOrders.filter(o => o.status === 'ACTIVE_RENTAL');
  const inspectionQueue = sellerOrders.filter(o => o.status === 'INSPECTION_PENDING');

  // Revenue = sum of rental amounts minus commission (e.g. 12%)
  const policy = store.getPolicy();
  const commissionRate = (policy.commissionB2CPercent || 12) / 100;

  const totalGrossRentalRevenue = completedOrders.reduce((sum, o) => sum + o.pricing.rentalAmount, 0);
  const platformCommissions = Math.round(totalGrossRentalRevenue * commissionRate);
  const totalNetEarnings = totalGrossRentalRevenue - platformCommissions;

  // Escrow deposits held for this seller's active orders (Explicitly NOT seller revenue)
  const activeOrderIds = new Set(activeRentals.map(o => o.id));
  const depositsHeldInEscrow = store
    .getDeposits()
    .filter(d => activeOrderIds.has(d.orderId) && d.status === 'HELD')
    .reduce((sum, d) => sum + d.amount, 0);

  // Pending payout for recently completed orders
  const pendingPayout = Math.round(totalNetEarnings * 0.4);

  // B2B membership stats
  const membershipPlans = [
    {
      id: 'plan_basic',
      name: 'Independent Creator',
      price: 0,
      itemLimit: 15,
      commissionPercent: 12,
      active: sellerId === 'usr_kavita_b2c'
    },
    {
      id: 'plan_pro',
      name: 'Boutique Pro',
      price: 1999,
      itemLimit: 75,
      commissionPercent: 9,
      active: sellerId === 'usr_vastra_b2b'
    },
    {
      id: 'plan_enterprise',
      name: 'Heritage Studio Network',
      price: 4999,
      itemLimit: 300,
      commissionPercent: 7,
      active: false
    }
  ];

  // Staff accounts
  const staffAccounts = [
    { id: 'stf_1', name: 'Pooja R. (Nungambakkam Fitting Lead)', role: 'Stylist & Inventory Staff', active: true },
    { id: 'stf_2', name: 'Karthik S. (Sanitization & QC)', role: 'QC & Logistics', active: true }
  ];

  const reviveMetrics = store.getReViveMetrics(sellerId);
  const reviveActivities = store.getReViveActivities();

  res.json({
    metrics: {
      totalNetEarnings,
      pendingPayout,
      depositsHeldInEscrow,
      activeRentalsCount: activeRentals.length,
      inspectionQueueCount: inspectionQueue.length,
      totalListedProducts: products.length,
      circularImpact: {
        co2SavedTotalKg: products.reduce((sum, p) => sum + p.usageCount * 14.5, 0),
        waterSavedTotalLiters: products.reduce((sum, p) => sum + p.usageCount * 850, 0)
      }
    },
    products,
    recentOrders: sellerOrders.slice(0, 8),
    inspectionQueue,
    membershipPlans,
    staffAccounts,
    reviveMetrics,
    reviveActivities
  });
});

export default router;
