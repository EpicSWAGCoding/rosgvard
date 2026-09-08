import express from 'express';
import { prisma } from '../prisma';
import { comparePassword } from '../utils/hash';
import { signAccessToken } from '../utils/jwt';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'phone and password required' });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signAccessToken({ userId: user.id, role: user.role });
  res.json({ accessToken: token });
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Malformed token' });
  const token = parts[1];
  const payload = require('../utils/jwt').verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, fullName: user.fullName, phone: user.phone, role: user.role, squadId: user.squadId });
});

export default router;
