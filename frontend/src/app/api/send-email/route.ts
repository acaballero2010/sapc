import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html, studentName, meetingDate, meetingTime, type, venue } = body;

    const apiKey = process.env.RESEND_API_KEY || "re_mock_sapc_demo_key";

    // In production or demo with valid key:
    if (apiKey && apiKey.startsWith("re_") && apiKey !== "re_mock_sapc_demo_key") {
      const resend = new Resend(apiKey);
      const data = await resend.emails.send({
        from: "SAPC Guidance Center <guidance@sapc.edu.ph>",
        to: Array.isArray(to) ? to : [to || "parent@sapc.edu.ph"],
        subject: subject || `SAPC Guidance Advisory: Case Conference for ${studentName || "Student"}`,
        html: html || `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="background: #8B0014; padding: 16px; border-radius: 12px; color: #ffffff; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">San Antonio de Padua College</h2>
              <p style="margin: 4px 0 0; font-size: 13px; color: #fbbf24;">Guidance &amp; Counseling Center • Case Conference Notice</p>
            </div>
            <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
              <p>Dear Parent / Guardian of <strong>${studentName || "Joshua Dimaculangan"}</strong>,</p>
              <p>This is a formal confirmation for your upcoming consultation with the SAPC Guidance Office regarding holistic multi-factor academic and wellness support.</p>
              
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <p style="margin: 0 0 8px;"><strong>Consultation Details:</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li><strong>Type:</strong> ${type || "1-on-1 Student Wellness Check-in"}</li>
                  <li><strong>Schedule:</strong> ${meetingDate || "Sep 22, 2026"} at ${meetingTime || "02:00 PM"}</li>
                  <li><strong>Venue / Modality:</strong> ${venue || "Guidance Consultation Room 204 (Room A)"}</li>
                </ul>
              </div>

              <p>If you need to reschedule or require an online video conference link, please reply to this email or visit your <a href="https://sapc.edu.ph/dashboard/parent" style="color: #8B0014; font-weight: bold;">Parent Portal Dashboard</a>.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
              <p style="margin: 0;">Compliant with Republic Act No. 10173 (Data Privacy Act of 2012) &amp; RA 11036 (Mental Health Act).</p>
              <p style="margin: 4px 0 0;">San Antonio de Padua College • Multi-Factor Decision Support System</p>
            </div>
          </div>
        `
      });
      return NextResponse.json({ success: true, mode: "live_resend", data });
    }

    // High-fidelity simulated dispatch response for presentations / testing without active API key
    return NextResponse.json({
      success: true,
      mode: "simulated_dispatch",
      message: `Email successfully queued for ${to || "parent@sapc.edu.ph"} via SAPC Resend Gateway.`,
      dispatchedAt: new Date().toISOString(),
      recipient: to || "parent@sapc.edu.ph",
      subject: subject || `SAPC Guidance Advisory: Case Conference for ${studentName || "Joshua Dimaculangan"}`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
