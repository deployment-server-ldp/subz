"use server";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { issueOtp, verifyOtp } from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email";
import { otpEmail, welcomeEmail } from "@/lib/email/templates";
import { rateLimit } from "@/lib/rate-limit";
import { uniqueSlug } from "@/lib/slug";
import {
  registerSchema,
  requestOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

export type ActionResult = { success: true } | { success: false; error: string };

export async function registerMember(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { firstName, lastName, email, password } = parsed.data;

  const limit = rateLimit(`register:${email}`, 5, 60 * 60_000);
  if (!limit.allowed) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Generic message — never confirm whether an email is already registered.
    return {
      success: false,
      error: "We couldn't create your account with those details. Try signing in instead.",
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {
          firstName,
          lastName,
          slug: uniqueSlug(`${firstName}-${lastName}`),
        },
      },
    },
  });

  const code = await issueOtp(user.id, "REGISTER");
  await sendEmail(welcomeEmail(email, firstName));
  await sendEmail(otpEmail(email, code));

  return { success: true };
}

export async function resendVerificationCode(input: unknown): Promise<ActionResult> {
  const parsed = requestOtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid email." };
  const { email } = parsed.data;

  const limit = rateLimit(`otp:register:${email}`, 5, 15 * 60_000);
  if (!limit.allowed) return { success: false, error: "Too many attempts. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Always report success even if the account doesn't exist or is already
  // verified, so this endpoint can't be used to enumerate registered emails.
  if (user && !user.emailVerifiedAt) {
    const code = await issueOtp(user.id, "REGISTER");
    await sendEmail(otpEmail(email, code));
  }
  return { success: true };
}

export async function verifyEmailCode(input: unknown): Promise<ActionResult> {
  const parsed = verifyOtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid code." };
  const { email, code } = parsed.data;

  const limit = rateLimit(`verify:${email}`, 10, 15 * 60_000);
  if (!limit.allowed) return { success: false, error: "Too many attempts. Please try again later." };

  const user = await verifyOtp(email, code, "REGISTER");
  if (!user) return { success: false, error: "That code is invalid or has expired." };

  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  return { success: true };
}

export async function requestLoginOtp(input: unknown): Promise<ActionResult> {
  const parsed = requestOtpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid email." };
  const { email } = parsed.data;

  const limit = rateLimit(`otp:login:${email}`, 5, 15 * 60_000);
  if (!limit.allowed) return { success: false, error: "Too many attempts. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.accountStatus === "ACTIVE") {
    const code = await issueOtp(user.id, "LOGIN");
    await sendEmail(otpEmail(email, code));
  }
  return { success: true };
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid email." };
  const { email } = parsed.data;

  const limit = rateLimit(`otp:reset:${email}`, 5, 15 * 60_000);
  if (!limit.allowed) return { success: false, error: "Too many attempts. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.accountStatus === "ACTIVE") {
    const code = await issueOtp(user.id, "RESET_PASSWORD");
    await sendEmail(otpEmail(email, code));
  }
  return { success: true };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, code, password } = parsed.data;

  const limit = rateLimit(`reset:${email}`, 10, 15 * 60_000);
  if (!limit.allowed) return { success: false, error: "Too many attempts. Please try again later." };

  const user = await verifyOtp(email, code, "RESET_PASSWORD");
  if (!user) return { success: false, error: "That code is invalid or has expired." };

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
