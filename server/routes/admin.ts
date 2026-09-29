import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.get('/dashboard', (req, res) => {
  const users = store.getUsers();
  const products = store.getProducts({ includeRetired: true });
  const orders = store.getOrders();
  const deposits = store.getDeposits();
  const disputes = store.getDisputes();
  const auditLogs = store.getAuditLogs();
  const policy = store.getPolicy();

  // Metrics
  const totalGmv = orders.reduce((sum, o) => sum + o.pricing.totalPaidToday, 0);
  const totalEscrowDepositsHeld = deposits
    .filter(d => d.status === 'HELD')
    .reduce((sum, d) => sum + d.amount, 0);
  const openDisputes = disputes.filter(d => d.status === 'OPEN');
  const activeRentals = orders.filter(o => o.status === 'ACTIVE_RENTAL');

  res.json({
    metrics: {
      totalGmv,
      totalOrders: orders.length,
      activeRentals: activeRentals.length,
      totalUsers: users.length,
      totalProducts: products.length,
      totalEscrowDepositsHeld,
      openDisputesCount: openDisputes.length,
      circularWearsRecorded: products.reduce((sum, p) => sum + p.usageCount, 0)
    },
    policy,
    disputes,
    recentAuditLogs: auditLogs.slice(0, 20),
    recentOrders: orders.slice(0, 10),
    users
  });
});

router.get('/policy', (req, res) => {
  res.json({ policy: store.getPolicy() });
});

router.put('/policy', (req, res) => {
  const actor = (req.headers['x-user-name'] as string) || 'Admin User';
  const updatedPolicy = store.updatePolicy(req.body, actor);
  res.json({ success: true, policy: updatedPolicy });
});

router.get('/audit-logs', (req, res) => {
  res.json({ auditLogs: store.getAuditLogs() });
});

export default router;
