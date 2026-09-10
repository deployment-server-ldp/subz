import "server-only";
import crypto from "node:crypto";
import type { OtpPurpose } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);

function generateCode(): string {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/** Creates and stores a new OTP for the user, returning the plaintext code to send by email. */
export async function issueOtp(userId: string, purpose: OtpPurpose): Promise<string> {
  const code = generateCode();
  await prisma.verificationOtp.create({
    data: {
      userId,
      purpose,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
    },
  });
  return code;
}

/** Verifies a submitted code against the most recent unconsumed OTP for that email + purpose. */
export async function verifyOtp(email: string, code: string, purpose: OtpPurpose) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;

  const otp = await prisma.verificationOtp.findFirst({
    where: { userId: user.id, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return null;
  if (otp.codeHash !== hashCode(code)) return null;

  await prisma.verificationOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return user;
}
