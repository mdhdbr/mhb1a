
import { NextResponse } from 'next/server';
import { decryptSecret, verifyOtp } from '@/lib/otp';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const { otp } = await req.json();
    const token = req.headers.get('authorization')?.split('Bearer ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    
    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
        return NextResponse.json({ error: 'Invalid OTP format.' }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await adminDb.collection('users').doc(uid).get();
    const data = userDoc.data();

    if (!data?.twoFactorSecret) {
        return NextResponse.json({ error: '2FA is not set up for this account.' }, { status: 400 });
    }

    const secret = decryptSecret(data.twoFactorSecret);
    const valid = verifyOtp(otp, secret);

    if (!valid) {
        return NextResponse.json({ error: 'Invalid OTP.' }, { status: 401 });
    }

    // Finalize the setup by marking 2FA as enabled.
    await adminDb.collection('users').doc(uid).set(
        {
        twoFactorEnabled: true,
        },
        { merge: true }
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error in 2FA verify route:', error);
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
