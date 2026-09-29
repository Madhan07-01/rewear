import { Router } from 'express';
import { store } from '../store';

const router = Router();

// GET all orders with optional role filtering
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const role = req.headers['x-user-role'] as string;
  const orders = store.getOrders(userId, role);
  res.json({ orders });
});

// GET single order
router.get('/:id', (req, res) => {
  const order = store.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const deposit = store.getDeposits().find(d => d.orderId === order.id);
  res.json({ order, deposit });
});

// POST create order (Checkout completion)
router.post('/', (req, res) => {
  try {
    const {
      productId,
      customerId,
      customerName,
      startDate,
      endDate,
      rentalDays,
      fulfilmentMethod,
      deliveryAddress,
      protectionPlanSelected
    } = req.body;

    if (!productId || !customerId) {
      return res.status(400).json({ error: 'productId and customerId are required' });
    }

    const order = store.createOrder({
      productId,
      customerId,
      customerName: customerName || 'Ananya Sharma',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      rentalDays: Number(rentalDays) || 3,
      fulfilmentMethod: fulfilmentMethod || 'PICKUP',
      deliveryAddress,
      protectionPlanSelected: Boolean(protectionPlanSelected)
    });

    const deposit = store.getDeposits().find(d => d.orderId === order.id);

    res.status(201).json({ success: true, order, deposit });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create order' });
  }
});

// POST Handover confirmation (QR / OTP verified + condition checklist photos)
router.post('/:id/handover', (req, res) => {
  try {
    const { verifiedMethod, frontPhoto, detailPhoto, conditionConfirmed, notes } = req.body;
    const order = store.handoverOrder(req.params.id, {
      verifiedMethod: verifiedMethod || 'QR',
      frontPhoto: frontPhoto || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      detailPhoto: detailPhoto || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      conditionConfirmed: conditionConfirmed || 'Excellent condition verified by both parties',
      notes
    });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST Return initiation by customer
router.post('/:id/return', (req, res) => {
  try {
    const { returnMethod, returnPhotos, customerNotes } = req.body;
    const order = store.returnOrder(req.params.id, {
      returnMethod: returnMethod || 'PICKUP',
      returnPhotos: returnPhotos || ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'],
      customerNotes
    });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST Inspection by seller (Full refund / partial deduction / dispute)
router.post('/:id/inspect', (req, res) => {
  try {
    const { conditionScore, depositOutcome, deductionAmount, deductionReason, repairEstimate, evidencePhotos } = req.body;
    const result = store.inspectOrder(req.params.id, {
      conditionScore: conditionScore || 'Excellent',
      depositOutcome: depositOutcome || 'FULL_REFUND',
      deductionAmount: Number(deductionAmount) || 0,
      deductionReason,
      repairEstimate,
      evidencePhotos: evidencePhotos || []
    });
    res.json({ success: true, order: result.order, deposit: result.deposit });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
