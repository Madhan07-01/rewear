import { Router } from 'express';
import { ChatMessage } from '../types';

const router = Router();

// In-memory chat storage per order
const orderChats: Map<string, ChatMessage[]> = new Map();

// Seed initial chat for ord_101
orderChats.set('ord_101', [
  {
    id: 'msg_1',
    orderId: 'ord_101',
    senderId: 'usr_kavita_b2c',
    senderName: 'Kavita Sundaram',
    text: 'Hello Ananya! The Black & Gold gown is freshly steamed and ready at the T. Nagar hub.',
    timestamp: '2026-09-28T12:10:00Z'
  },
  {
    id: 'msg_2',
    orderId: 'ord_101',
    senderId: 'usr_ananya',
    senderName: 'Ananya Sharma',
    text: 'Wonderful Kavita! I have my 6-digit pickup OTP ready for the counter scan.',
    timestamp: '2026-09-28T12:15:00Z'
  }
]);

router.get('/:orderId', (req, res) => {
  const messages = orderChats.get(req.params.orderId) || [];
  res.json({ messages });
});

router.post('/:orderId', (req, res) => {
  const { senderId, senderName, text } = req.body;
  const messages = orderChats.get(req.params.orderId) || [];

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}`,
    orderId: req.params.orderId,
    senderId: senderId || 'usr_ananya',
    senderName: senderName || 'Ananya Sharma',
    text: text || '',
    timestamp: new Date().toISOString()
  };

  messages.push(newMsg);
  orderChats.set(req.params.orderId, messages);

  res.status(201).json({ success: true, message: newMsg });
});

export default router;
