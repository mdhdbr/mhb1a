
import { NextResponse } from 'next/server';
import { generateOtpSecret, encryptSecret } from '@/lib/otp';
import QRCode from 'qrcode';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email;

    if (!email) {
        return NextResponse.json({ error: 'User email not found in token.' }, { status: 400 });
    }

    const { secret, otpauth } = generateOtpSecret(email, 'Pro Seed');
    const qrCode = await QRCode.toDataURL(otpauth);
    const encryptedSecret = encryptSecret(secret);

    // Store the encrypted secret. It will be finalized when the user verifies the first OTP.
    await adminDb.collection('users').doc(uid).set(
      {
        twoFactorSecret: encryptedSecret,
        twoFactorEnabled: false, // Not enabled until verified
      },
      { merge: true }
    );

    // The manual key (the raw secret) is sent back for cases where QR scanning is not possible.
    // The client should display this securely and temporarily.
    return NextResponse.json({
      qrCode,
      manualKey: secret,
    });

  } catch (error: any) {
    console.error('Error in 2FA generate route:', error);
    let errorMessage = 'An internal server error occurred.';
    let statusCode = 500;

    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expired. Please log in again.';
      statusCode = 401;
    } else if (error.code?.startsWith('auth/')) {
      errorMessage = 'Unauthorized: Invalid token.';
      statusCode = 401;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
