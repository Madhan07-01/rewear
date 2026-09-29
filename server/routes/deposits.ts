import { Router } from 'express';
import { store } from '../store';

const router = Router();

// GET all deposits
router.get('/', (req, res) => {
  const deposits = store.getDeposits();
  res.json({ deposits });
});

// GET single deposit
router.get('/:id', (req, res) => {
  const deposit = store.getDepositById(req.params.id);
  if (!deposit) {
    return res.status(404).json({ error: 'Deposit record not found' });
  }
  res.json({ deposit });
});

export default router;
