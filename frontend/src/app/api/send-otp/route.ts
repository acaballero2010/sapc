import { NextResponse } from "next/server";
import { Resend } from "resend";

// Module-level in-memory OTP store: email -> { code, expiresAt }
// This persists across requests within the same Node.js process instance.
// For multi-instance production, replace with Redis or Firestore.
export const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  teacher: "Faculty / Adviser",
  guidance_counselor: "Guidance Counselor",
  parent: "Parent / Guardian",
  admin: "Administrator"
};

export async function POST(req: Request) {
  try {
    const { email, name, role } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const code = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10-minute TTL
    otpStore.set(email.toLowerCase().trim(), { code, expiresAt });

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || !apiKey.startsWith("re_")) {
      // Dev fallback: log OTP to server console
      console.info(`[OTP DEV] Code for ${email}: ${code}`);
      return NextResponse.json({
        success: true,
        mode: "dev_console",
        _dev_otp: process.env.NODE_ENV !== "production" ? code : undefined
      });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "SAPC IntellySys <onboarding@resend.dev>",
      to: [email],
      subject: `[${code}] Your SAPC IntellySys Verification Code`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;">
          <div style="background:linear-gradient(135deg,#8B0014 0%,#5A000D 100%);border-radius:12px;padding:20px;text-align:center;border-bottom:4px solid #D97706;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">San Antonio de Padua College</h1>
            <p style="margin:6px 0 0;color:#fbbf24;font-size:12px;font-weight:700;">SAPC IntellySys &bull; Account Verification</p>
          </div>
          <div style="padding:28px 8px 16px;color:#334155;font-size:14px;line-height:1.7;">
            <p style="margin:0 0 12px;">Dear <strong>${name || "Registrant"}</strong>,</p>
            <p style="margin:0 0 16px;">You are registering as a <strong>${ROLE_LABELS[role] || role}</strong> on the SAPC IntellySys multi-factor guidance platform. Use the one-time verification code below to complete your enrollment:</p>
            <div style="margin:24px 0;text-align:center;">
              <div style="display:inline-block;background:#fef3c7;border:2px dashed #D97706;border-radius:14px;padding:18px 36px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:2px;">One-Time Verification Code</p>
                <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:14px;color:#8B0014;font-family:'Courier New',monospace;">${code}</p>
              </div>
            </div>
            <p style="font-size:12px;color:#64748b;text-align:center;margin:0;">&#9200; This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94a3b8;text-align:center;">
            <p style="margin:0;">Compliant with Republic Act No. 10173 (Data Privacy Act of 2012)</p>
            <p style="margin:4px 0 0;">San Antonio de Padua College &bull; Lucena City, Quezon, Philippines</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      mode: "live_resend",
      message: `Verification code sent to ${email}. Check your inbox.`
    });
  } catch (error: any) {
    console.error("[send-otp] Resend error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
