import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const decoded = await adminAuth.verifyIdToken(token);
    const uid = decoded.uid;

    const requesterDoc = await adminDb.collection('users').doc(uid).get();
    const requesterData = requesterDoc.data();
    const requesterRole = String(requesterData?.role ?? '').toLowerCase();

    if (requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snap = await adminDb.collection('users').get();
    const users = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, unknown>) }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in admin users route:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
