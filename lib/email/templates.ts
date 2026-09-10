import type { EmailMessage } from "@/lib/email";

const APP_NAME = "SUBZWARI GLOBAL NETWORK";

function wrap(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="font-family:sans-serif;background:#f7f5f0;padding:24px;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;">
      <p style="letter-spacing:2px;font-size:12px;color:#1f5c47;font-weight:600;">${APP_NAME}</p>
      <h1 style="font-size:20px;margin:16px 0;">${title}</h1>
      ${bodyHtml}
    </div>
  </body></html>`;
}

export function welcomeEmail(to: string, firstName: string): EmailMessage {
  return {
    to,
    subject: `Welcome to ${APP_NAME}`,
    html: wrap(
      `Welcome, ${firstName}.`,
      `<p>Your account has been created. Complete your profile and submit it for verification to be discoverable across the global Subzwari community.</p>`,
    ),
    text: `Welcome to ${APP_NAME}, ${firstName}. Complete your profile and submit it for verification to join the community directory.`,
  };
}

export function otpEmail(to: string, code: string): EmailMessage {
  return {
    to,
    subject: `Your ${APP_NAME} verification code`,
    html: wrap(`Your verification code`, `<p style="font-size:28px;letter-spacing:4px;font-weight:700;">${code}</p><p>This code expires in ${process.env.OTP_EXPIRY_MINUTES ?? 10} minutes.</p>`),
    text: `Your ${APP_NAME} verification code is ${code}. It expires in ${process.env.OTP_EXPIRY_MINUTES ?? 10} minutes.`,
  };
}

export function verificationSubmittedEmail(to: string): EmailMessage {
  return {
    to,
    subject: "Your verification request has been submitted",
    html: wrap("Verification submitted", `<p>Our community team will review your submission. We'll notify you as soon as a decision is made.</p>`),
    text: "Your verification request has been submitted and is pending review.",
  };
}

export function verificationApprovedEmail(to: string): EmailMessage {
  return {
    to,
    subject: "You're verified on SUBZWARI GLOBAL NETWORK",
    html: wrap("You're verified", `<p>Congratulations — your profile is now verified and visible to the global Subzwari community per your privacy settings.</p>`),
    text: "Congratulations — your profile is now verified.",
  };
}

export function verificationRejectedEmail(to: string, reason?: string): EmailMessage {
  return {
    to,
    subject: "Update on your verification request",
    html: wrap("Verification update", `<p>Your verification request was not approved.${reason ? ` Reason: ${reason}` : ""}</p><p>You may update your information and resubmit at any time.</p>`),
    text: `Your verification request was not approved.${reason ? ` Reason: ${reason}` : ""}`,
  };
}

export function verificationMoreInfoEmail(to: string, notes?: string): EmailMessage {
  return {
    to,
    subject: "More information needed for your verification",
    html: wrap("More information needed", `<p>Our reviewers need more information before deciding on your verification request.${notes ? ` Notes: ${notes}` : ""}</p>`),
    text: `More information is needed for your verification request.${notes ? ` Notes: ${notes}` : ""}`,
  };
}

export function connectionRequestEmail(to: string, fromName: string): EmailMessage {
  return {
    to,
    subject: `${fromName} wants to connect with you`,
    html: wrap("New connection request", `<p>${fromName} has sent you a connection request on ${APP_NAME}.</p>`),
    text: `${fromName} has sent you a connection request on ${APP_NAME}.`,
  };
}

export function adminAnnouncementEmail(to: string, title: string, body: string): EmailMessage {
  return {
    to,
    subject: title,
    html: wrap(title, `<p>${body}</p>`),
    text: body,
  };
}
