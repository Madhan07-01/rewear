import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.post('/reset', (req, res) => {
  store.reset();
  res.json({ success: true, message: 'ReWear demo state reset to initial seed data' });
});

export default router;
