import { Router } from 'express';
import { store } from '../store';

const router = Router();

// GET ReVive summary metrics
router.get('/metrics', (req, res) => {
  const sellerId = req.headers['x-user-id'] as string;
  const metrics = store.getReViveMetrics(sellerId);
  res.json({ metrics });
});

// GET ReVive live activity and seller notifications
router.get('/activities', (req, res) => {
  const activities = store.getReViveActivities();
  res.json({ activities });
});

// GET ReVive verified partner directory
router.get('/partners', (req, res) => {
  const { type, city } = req.query as { type?: string; city?: string };
  const partners = store.getReVivePartners(type, city);
  res.json({ partners });
});

// GET single partner
router.get('/partners/:id', (req, res) => {
  const partner = store.getReVivePartnerById(req.params.id);
  if (!partner) {
    return res.status(404).json({ error: 'Partner not found' });
  }
  res.json({ partner });
});

// GET seller ReVive item queue (all products + next action recommendation)
router.get('/queue', (req, res) => {
  const sellerId = (req.headers['x-user-id'] as string) || 'usr_kavita_b2c';
  const allProducts = store.getProducts({ includeRetired: true, sellerId });
  const allPartners = store.getReVivePartners();

  const queue = allProducts.map(product => {
    // Transparent rule-based recommendation
    let recommended: 'REPAIR' | 'DONATE' | 'UPCYCLE' | 'RECYCLE' | 'RETIRE' = 'DONATE';
    let recommendationReason = '';
    let partnerCount = 0;

    const conditionLower = product.condition.toLowerCase();
    const isDamaged = conditionLower.includes('damage');
    const isFair = conditionLower === 'fair';
    const isHighWears = product.usageCount >= 25;

    if (conditionLower === 'retired') {
      recommended = 'RETIRE';
      recommendationReason = 'Garment already retired from active rental pool.';
      partnerCount = 1;
    } else if (isDamaged && (product.category === 'Lehenga' || product.category === 'Sherwani' || product.category === 'Saree')) {
      // Intricate embroidery suitable for craft salvage
      recommended = 'UPCYCLE';
      recommendationReason = 'Heavy border/embroidery intact; prime for artisanal potli or craft conversion.';
      partnerCount = allPartners.filter(p => p.partnerType === 'UPCYCLE_STUDIO').length;
    } else if (isDamaged) {
      recommended = 'RECYCLE';
      recommendationReason = 'Structural fabric tearing; prime for closed-loop textile fiber recovery.';
      partnerCount = allPartners.filter(p => p.partnerType === 'RECYCLING_HUB').length;
    } else if (product.repairsCount < 2 && isFair) {
      recommended = 'REPAIR';
      recommendationReason = 'Minor repairable wear. Restoring allows relisting at top rental value.';
      partnerCount = 2; // Tailor partner ateliers
    } else if (isFair || isHighWears) {
      recommended = 'DONATE';
      recommendationReason = 'Clean and wearable with dignified utility for community college closets and NGOs.';
      partnerCount = allPartners.filter(p => p.partnerType === 'DONATION_NGO' || p.partnerType === 'COMMUNITY_WARDROBE' || p.partnerType === 'COLLEGE_CLOSET').length;
    } else {
      recommended = 'REPAIR';
      recommendationReason = 'Routine maintenance inspection recommended.';
      partnerCount = 2;
    }

    // Allow product override if preset
    if (product.recommendedNextLife) {
      recommended = product.recommendedNextLife;
    }

    const needsAction =
      product.condition === 'Fair' ||
      product.condition === 'Damaged' ||
      product.condition === 'Minor damage' ||
      product.condition === 'Major damage' ||
      product.lifecycleStatus === 'INSPECTION_PENDING' ||
      product.lifecycleStatus === 'IN_REPAIR' ||
      product.lifecycleStatus === 'DONATION_PENDING' ||
      product.lifecycleStatus === 'DONATION_SCHEDULED' ||
      product.lifecycleStatus === 'RECYCLER_QUOTE_RECEIVED' ||
      product.lifecycleStatus === 'UPCYCLING_PENDING';

    const isCompleted =
      product.lifecycleStatus === 'DONATED' ||
      product.lifecycleStatus === 'RECYCLED' ||
      product.lifecycleStatus === 'UPCYCLED' ||
      product.lifecycleStatus === 'RETIRED';

    return {
      product,
      recommendedRoute: recommended,
      recommendationReason,
      nearestPartnerCount: partnerCount || 2,
      estimatedWeightKg: product.estimatedWeightKg || 1.0,
      estimatedRecyclerPayout: Math.round((product.estimatedWeightKg || 1.0) * 30),
      needsAction,
      isCompleted
    };
  });

  res.json({ queue });
});

// GET all ReVive requests
router.get('/requests', (req, res) => {
  const sellerId = req.headers['x-user-id'] as string;
  const requests = store.getReViveRequests(sellerId);
  res.json({ requests });
});

// GET single request
router.get('/requests/:id', (req, res) => {
  const request = store.getReViveRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'ReVive request not found' });
  }
  res.json({ request });
});

// POST create ReVive request
router.post('/requests', (req, res) => {
  try {
    const newRequest = store.createReViveRequest(req.body);
    res.status(201).json({ success: true, request: newRequest });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update request
router.put('/requests/:id', (req, res) => {
  try {
    const updated = store.updateReViveRequest(req.params.id, req.body);
    res.json({ success: true, request: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST confirm ReVive outcome (handover confirmation, payout, receipt, certificate)
router.post('/requests/:id/confirm-outcome', (req, res) => {
  try {
    const result = store.confirmReViveOutcome(req.params.id, req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
