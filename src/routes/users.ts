import express from 'express';
import { prisma } from '../prisma';
import { hashPassword } from '../utils/hash';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  // only admin should create users — simple check
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { fullName, phone, password, role, squadId } = req.body;
  if (!fullName || !phone || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { fullName, phone, password: hashed, role: role || 'staff', squadId }
  });
  res.json(user);
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const q = req.query;
  const where: any = {};
  if (q.squad_id) where.squadId = String(q.squad_id);
  if (q.status) where.status = String(q.status);
  const users = await prisma.user.findMany({ where });
  res.json(users);
});

router.get('/:id', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const data = req.body;
  if (data.password) data.password = await hashPassword(data.password);
  try {
    const updated = await prisma.user.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

export default router;
