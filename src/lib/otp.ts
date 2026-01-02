
import { authenticator } from 'otplib';
import CryptoJS from 'crypto-js';

authenticator.options = {
  step: 30,
  digits: 6,
};

const OTP_SECRET_KEY = process.env.OTP_SECRET_KEY || 'a-secure-default-key-for-development-only';

if (process.env.NODE_ENV === 'production' && OTP_SECRET_KEY === 'a-secure-default-key-for-development-only') {
    console.error('CRITICAL: OTP_SECRET_KEY is not set in the environment. Using insecure default key.');
}


/** Generate OTP Secret */
export function generateOtpSecret(email: string, appName: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, appName, secret);

  return { secret, otpauth };
}

/** Verify OTP */
export function verifyOtp(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

/** Encrypt Secret */
export function encryptSecret(secret: string) {
  const key = OTP_SECRET_KEY;
  if (!key) {
    throw new Error('Cannot encrypt secret: OTP_SECRET_KEY is not configured.');
  }
  return CryptoJS.AES.encrypt(secret, key).toString();
}

/** Decrypt Secret */
export function decryptSecret(cipher: string) {
  const key = OTP_SECRET_KEY;
  if (!key) {
    throw new Error('Cannot decrypt secret: OTP_SECRET_KEY is not configured.');
  }
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
