import express from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { name, leadId } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const squad = await prisma.squad.create({ data: { name, leadId } });
  res.json(squad);
});

router.get('/', requireAuth, async (req, res) => {
  const squads = await prisma.squad.findMany({ include: { members: true } });
  res.json(squads);
});

router.get('/:id', requireAuth, async (req, res) => {
  const squad = await prisma.squad.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!squad) return res.status(404).json({ error: 'Not found' });
  res.json(squad);
});

router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const updated = await prisma.squad.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    await prisma.squad.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

export default router;
