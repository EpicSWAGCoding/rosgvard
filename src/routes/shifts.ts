import express from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();

// Create shift (admin, squad_lead)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'squad_lead') return res.status(403).json({ error: 'Forbidden' });
  const { title, type, location, start_at, end_at } = req.body;
  if (!title || !type || !start_at || !end_at) return res.status(400).json({ error: 'Missing fields' });
  const shift = await prisma.shift.create({
    data: {
      title,
      type,
      location,
      startAt: new Date(start_at),
      endAt: new Date(end_at),
      createdById: req.user?.userId,
    },
  });
  res.json(shift);
});

// List shifts
router.get('/', requireAuth, async (req, res) => {
  const { from, to, squad_id, user_id } = req.query;
  const where: any = {};
  if (from || to) where.startAt = {};
  if (from) where.startAt.gte = new Date(String(from));
  if (to) where.startAt.lte = new Date(String(to));
  const shifts = await prisma.shift.findMany({ where, include: { assignments: true } });
  res.json(shifts);
});

// Get current user's shifts (specific route must be before '/:id')
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const assignments = await prisma.shiftAssignment.findMany({ where: { userId }, include: { shift: true } });
  res.json(assignments);
});

// Get single shift
router.get('/:id', requireAuth, async (req, res) => {
  const shift = await prisma.shift.findUnique({ where: { id: req.params.id }, include: { assignments: true } });
  if (!shift) return res.status(404).json({ error: 'Not found' });
  res.json(shift);
});

// Update shift
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const data: any = {};
    if (req.body.title) data.title = req.body.title;
    if (req.body.type) data.type = req.body.type;
    if (req.body.location) data.location = req.body.location;
    if (req.body.start_at) data.startAt = new Date(req.body.start_at);
    if (req.body.end_at) data.endAt = new Date(req.body.end_at);
    const updated = await prisma.shift.update({ where: { id }, data });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// Delete shift
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await prisma.shift.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

// Assign user to shift
router.post('/:id/assign', requireAuth, async (req: AuthRequest, res) => {
  const { user_id, is_senior } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const shiftId = req.params.id;
  try {
    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId,
        userId: user_id,
        isSenior: Boolean(is_senior),
      },
    });
    res.json(assignment);
  } catch (e) {
    res.status(400).json({ error: 'Assign failed' });
  }
});

// Replace assignment: mark old as replaced and optionally create new assignment
router.post('/:id/replace', requireAuth, async (req: AuthRequest, res) => {
  const { old_user_id, new_user_id, reason } = req.body;
  const shiftId = req.params.id;
  if (!old_user_id || !new_user_id) return res.status(400).json({ error: 'old_user_id and new_user_id required' });
  try {
    const oldAssign = await prisma.shiftAssignment.findFirst({ where: { shiftId, userId: old_user_id } });
    if (!oldAssign) return res.status(404).json({ error: 'Old assignment not found' });
    await prisma.shiftAssignment.update({ where: { id: oldAssign.id }, data: { status: 'replaced', replacedById: new_user_id } });
    const newAssign = await prisma.shiftAssignment.create({ data: { shiftId, userId: new_user_id, status: 'assigned' } });
    res.json({ old: oldAssign.id, created: newAssign });
  } catch (e) {
    res.status(400).json({ error: 'Replace failed' });
  }
});

// Get current user's shifts
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  const assignments = await prisma.shiftAssignment.findMany({ where: { userId }, include: { shift: true } });
  res.json(assignments);
});

export default router;
