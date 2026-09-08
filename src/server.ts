import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import squadsRoutes from './routes/squads';
import shiftsRoutes from './routes/shifts';
import pushRoutes from './routes/push';
import notificationsRoutes from './routes/notifications';
import path from 'path';
import { startNotificationScheduler } from './scheduler/notificationScheduler';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/squads', squadsRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/notifications', notificationsRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.get('/api', (req, res) => {
  res.json({ message: 'Rosgvard shifts API' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
  try {
    startNotificationScheduler();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to start scheduler', e);
  }
});
