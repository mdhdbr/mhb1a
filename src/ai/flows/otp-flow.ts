
'use server';
/**
 * @fileOverview A simple OTP (One-Time Password) service for user verification.
 *
 * - sendOtp: A function to simulate sending an OTP to a user's phone.
 * - verifyOtp: A function to verify the OTP provided by the user.
 * - VerifyOtpInput: The input type for the verifyOtp function.
 * - VerifyOtpOutput: The return type for the verifyOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for sending an OTP (input is just a phone number string)
export const SendOtpInputSchema = z.string().describe('The phone number to send the OTP to.');
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

// Schema for verifying an OTP
export const VerifyOtpInputSchema = z.object({
  phone: z.string().describe('The phone number that received the OTP.'),
  code: z.string().length(4).describe('The 4-digit code entered by the user.'),
});
export type VerifyOtpInput = z.infer<typeof VerifyOtpInputSchema>;

export const VerifyOtpOutputSchema = z.object({
  success: z.boolean().describe('Whether the OTP verification was successful.'),
});
export type VerifyOtpOutput = z.infer<typeof VerifyOtpOutputSchema>;

/**
 * Simulates sending an OTP to a phone number.
 * In a real application, this would integrate with an SMS service like Twilio.
 * @param phone The phone number to send the OTP to.
 * @returns A promise that resolves when the operation is complete.
 */
export async function sendOtp(phone: SendOtpInput): Promise<void> {
  await sendOtpFlow(phone);
}

/**
 * Verifies a 4-digit OTP for a given phone number.
 * @param input An object containing the phone number and the OTP code.
 * @returns A promise that resolves to an object indicating if the verification was successful.
 */
export async function verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
  return await verifyOtpFlow(input);
}


const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: z.void(),
  },
  async (phone) => {
    // In a real-world scenario, you would:
    // 1. Generate a random 4-digit code.
    // const code = Math.floor(1000 + Math.random() * 9000).toString();
    // 2. Store the code and phone number (e.g., in Firestore) with an expiry.
    // 3. Use an SMS service (e.g., Twilio) to send the code to the user's phone.
    
    console.log(`(DEMO) OTP Flow: Pretending to send OTP to ${phone}.`);
    // For this demo, we do nothing on the server. The client-side toast will guide the user.
    return;
  }
);

const verifyOtpFlow = ai.defineFlow(
  {
    name: 'verifyOtpFlow',
    inputSchema: VerifyOtpInputSchema,
    outputSchema: VerifyOtpOutputSchema,
  },
  async ({ phone, code }) => {
    // In a real-world scenario, you would:
    // 1. Look up the stored OTP for the given phone number in your database.
    // 2. Check if the code matches and has not expired.
    // 3. Delete the used OTP from the database.
    
    console.log(`(DEMO) Verifying OTP: Received code ${code} for phone ${phone}.`);

    // For this demo, we use a static OTP for simplicity.
    const isSuccess = code === '1234';

    if (isSuccess) {
      console.log(`(DEMO) OTP for ${phone} is correct.`);
    } else {
      console.log(`(DEMO) OTP for ${phone} is incorrect.`);
    }
    
    return { success: isSuccess };
  }
);
