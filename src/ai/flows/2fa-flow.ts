
'use server';
/**
 * @fileOverview Manages Two-Factor Authentication (2FA) verification using TOTP during login.
 *
 * - verify2faCode: Verifies a TOTP code for an already-enabled user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { verifyOtp, decryptSecret } from '@/lib/otp';


// --- Zod Schemas ---
export const Verify2faCodeInputSchema = z.object({
    encryptedSecret: z.string().describe('The encrypted secret stored in the user profile.'),
    code: z.string().length(6).describe('The 6-digit code from the authenticator app.'),
});
export type Verify2faCodeInput = z.infer<typeof Verify2faCodeInputSchema>;


// --- Public API Functions ---

export async function verify2faCode(input: Verify2faCodeInput): Promise<{ success: boolean }> {
    return verify2faCodeFlow(input);
}


// --- Genkit Flows ---

const verify2faCodeFlow = ai.defineFlow(
    {
        name: 'verify2faCodeFlow',
        inputSchema: Verify2faCodeInputSchema,
        outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ encryptedSecret, code }) => {
        try {
            const secret = decryptSecret(encryptedSecret);
            const isValid = verifyOtp(code, secret);
            return { success: isValid };
        } catch (error) {
            console.error('2FA code verification failed:', error);
            return { success: false };
        }
    }
);
