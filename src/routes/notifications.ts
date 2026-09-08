import express from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';
import { sendPush } from '../utils/push';

const router = express.Router();

// Create notification (admin)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { userId, type, channel, message, shiftAssignmentId } = req.body;
  if (!userId || !type || !channel || !message) return res.status(400).json({ error: 'Missing fields' });
  try {
    const notification = await prisma.notification.create({ data: { userId, type, channel, message, shiftAssignmentId } });

    if (channel === 'push') {
      const subs = await prisma.pushSubscription.findMany({ where: { userId } });
      const payload = { title: 'Уведомление', body: message, data: { notificationId: notification.id } };
      for (const s of subs) {
        try {
          await sendPush({ endpoint: s.endpoint, keys: { p256dh: s.keysP256dh, auth: s.keysAuth } }, payload);
        } catch (e) {
          // ignore push errors for now
        }
      }
    }

    res.json(notification);
  } catch (e) {
    res.status(400).json({ error: 'Create notification failed' });
  }
});

// List my notifications
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const notes = await prisma.notification.findMany({ where: { userId }, orderBy: { sentAt: 'desc' } });
  res.json(notes);
});

// Acknowledge
router.post('/:id/acknowledge', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const updated = await prisma.notification.update({ where: { id }, data: { acknowledgedAt: new Date() } });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Acknowledge failed' });
  }
});

export default router;
