import { Router } from 'express';
import { store } from '../store';

const router = Router();

// Login / Demo Switch
router.post('/login', (req, res) => {
  const { email, role, userId } = req.body;
  const users = store.getUsers();

  let user = userId ? store.getUserById(userId) : undefined;
  if (!user && email) {
    user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  if (!user && role) {
    user = users.find(u => u.role === role);
  }
  if (!user) {
    user = users[0]; // fallback to Ananya
  }

  res.json({
    success: true,
    token: `jwt_demo_${user.id}_${Date.now()}`,
    user
  });
});

router.get('/me', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr_ananya';
  const user = store.getUserById(userId) || store.getUserById('usr_ananya');
  res.json({ user });
});

router.patch('/profile', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_ananya';
  const updated = store.updateUser(userId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, user: updated });
});

router.get('/users', (req, res) => {
  res.json({ users: store.getUsers() });
});

export default router;
