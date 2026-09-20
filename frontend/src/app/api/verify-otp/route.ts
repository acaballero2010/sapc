import { NextResponse } from "next/server";
import { otpStore } from "../send-otp/route";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: "Email and code are required." }, { status: 400 });
    }

    const key = email.toLowerCase().trim();
    const record = otpStore.get(key);

    if (!record) {
      return NextResponse.json({
        success: false,
        error: "No verification code was found for this email. Please request a new one."
      }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(key);
      return NextResponse.json({
        success: false,
        error: "This verification code has expired. Please request a new code."
      }, { status: 400 });
    }

    if (record.code !== code.toString().trim()) {
      return NextResponse.json({
        success: false,
        error: "Incorrect verification code. Please check the email and try again."
      }, { status: 400 });
    }

    // Code matched — remove it so it can't be reused
    otpStore.delete(key);

    return NextResponse.json({ success: true, message: "Email verified successfully." });
  } catch (error: any) {
    console.error("[verify-otp] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
