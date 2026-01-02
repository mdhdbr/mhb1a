
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// This configuration is for the SERVER-SIDE Admin SDK.
// It uses environment variables for secure initialization.

// Check if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Validate that the required service account fields are present.
    // This is especially important for Vercel's build process.
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // The private key needs newlines correctly formatted.
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } else {
        // Log a warning if run in an environment where variables are expected but missing
        // This might happen during local dev if .env.local isn't set up, or in a misconfigured Vercel env.
        if (process.env.NODE_ENV === 'production') {
             console.warn('Firebase Admin SDK not initialized. Missing environment variables.');
        }
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
