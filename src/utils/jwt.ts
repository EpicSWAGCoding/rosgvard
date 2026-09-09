import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'please_change_me';

export const signAccessToken = (
  payload: JwtPayload | string,
  expiresIn: unknown = '15m'
) => {
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload | string;
  } catch (e) {
    return null;
  }
};
