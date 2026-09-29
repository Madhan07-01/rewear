import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req, res) => {
  res.json({ disputes: store.getDisputes() });
});

router.post('/:id/resolve', (req, res) => {
  try {
    const { outcome, notes, actor } = req.body;
    const dispute = store.resolveDispute(req.params.id, outcome || 'FULL_REFUND', notes || 'Admin arbitration complete.', actor || 'ReWear Admin');
    res.json({ success: true, dispute });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
