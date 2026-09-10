import "server-only";

// Provider-agnostic email sending (ARCHITECTURE.md §F, README §37). Behind
// this one function, swap in Resend/SES/SMTP per EMAIL_PROVIDER without
// touching call sites in modules/*. The "console" fallback keeps local
// development working with zero email credentials configured.
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM_ADDRESS,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    return;
  }

  // Dev fallback: log instead of sending, so registration/OTP/notification
  // flows are fully testable without real email provider credentials.
  console.log(`[email:${provider}] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}`);
}
