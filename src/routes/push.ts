import express from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Return VAPID public key for clients
router.get('/vapid-key', (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY || '';
  res.json({ publicKey: key });
});

// Subscribe to push
router.post('/subscribe', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys) return res.status(400).json({ error: 'endpoint and keys required' });
  try {
    const sub = await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint,
        keysP256dh: keys.p256dh,
        keysAuth: keys.auth,
      },
    });
    res.json(sub);
  } catch (e) {
    res.status(400).json({ error: 'Subscribe failed' });
  }
});

// Unsubscribe (delete by endpoint)
router.post('/unsubscribe', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
  try {
    await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Unsubscribe failed' });
  }
});

export default router;
