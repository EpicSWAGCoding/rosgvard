import axios from 'axios';

export async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.SMS_API_KEY;
  const provider = process.env.SMS_PROVIDER || 'stub';
  if (!apiKey || provider === 'stub') {
    // In development just log the attempt
    // eslint-disable-next-line no-console
    console.log(`[SMS stub] To=${phone} Message=${message}`);
    return { ok: true, stub: true };
  }

  // Example for a generic provider (stubbed): implement provider-specific API here
  try {
    const res = await axios.post(process.env.SMS_API_URL || '', {
      api_key: apiKey,
      to: phone,
      text: message,
    });
    return res.data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('SMS send error', e);
    throw e;
  }
}
