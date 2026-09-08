import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendPush } from '../utils/push';
import { sendSMS } from '../utils/sms';

const WINDOW_MINUTES = 15; // window around target time to find shifts

async function sendNotificationForAssignment(assignment: any, shift: any, hoursBefore: number) {
  const message = `Напоминание: ${shift.title} начнётся ${new Date(shift.startAt).toLocaleString()}`;
  const userId = assignment.userId;
  // Check if notification already exists for this assignment and this timing
  const exists = await prisma.notification.findFirst({ where: { shiftAssignmentId: assignment.id, type: 'upcoming_shift', message } });
  if (exists) return;

  // Create DB record for push
  const note = await prisma.notification.create({ data: { shiftAssignmentId: assignment.id, userId, type: 'upcoming_shift', channel: 'push', message } });

  // Try to send push
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let pushSent = false;
  for (const s of subs) {
    try {
      await sendPush({ endpoint: s.endpoint, keys: { p256dh: s.keysP256dh, auth: s.keysAuth } }, { title: shift.title, body: message, data: { notificationId: note.id } });
      pushSent = true;
    } catch (e) {
      // ignore individual push errors
    }
  }

  if (!pushSent) {
    // fallback to SMS (best-effort)
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.phone) {
        await sendSMS(user.phone, message);
        await prisma.notification.create({ data: { shiftAssignmentId: assignment.id, userId, type: 'upcoming_shift', channel: 'sms', message } });
      }
    } catch (e) {
      // log and continue
      // eslint-disable-next-line no-console
      console.error('SMS fallback failed', e);
    }
  }
}

async function checkAndSchedule() {
  const now = new Date();
  const windows = [24, 2];
  for (const hours of windows) {
    const target = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const start = new Date(target.getTime() - WINDOW_MINUTES * 60 * 1000);
    const end = new Date(target.getTime() + WINDOW_MINUTES * 60 * 1000);

    const shifts = await prisma.shift.findMany({ where: { startAt: { gte: start, lte: end } }, include: { assignments: true } });
    for (const shift of shifts) {
      for (const assignment of shift.assignments) {
        // Only notify assigned / confirmed statuses
        if (assignment.status === 'cancelled' || assignment.status === 'replaced') continue;
        await sendNotificationForAssignment(assignment, shift, hours);
      }
    }
  }
}

export function startNotificationScheduler() {
  if (process.env.DISABLE_SCHEDULER === '1') return;
  // run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      // eslint-disable-next-line no-console
      console.log('[scheduler] checking shifts for upcoming notifications', new Date().toISOString());
      await checkAndSchedule();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[scheduler] error', e);
    }
  });
  // eslint-disable-next-line no-console
  console.log('Notification scheduler started (every 15 minutes)');
}
