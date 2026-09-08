import webpush from 'web-push';

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export const sendPush = async (subscription: any, payload: object) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    throw new Error('VAPID keys not configured');
  }
  try {
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const result = await webpush.sendNotification(subscription, body);
    return result;
  } catch (e) {
    throw e;
  }
};

export const getVapidPublicKey = () => VAPID_PUBLIC;
