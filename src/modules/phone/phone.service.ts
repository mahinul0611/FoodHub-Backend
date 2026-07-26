import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { transporter } from "../../lib/auth";

const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

const sendOtp = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.phoneVerified) {
    throw new Error("Your phone number is already verified");
  }
  if (!user.phone) {
    throw new Error("Add a phone number to your profile first");
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  await prisma.user.update({
    where: { id: userId },
    data: {
      phoneOtp: hashOtp(otp),
      phoneOtpExpires: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await transporter.sendMail({
    from: '"FoodHub" <hello@mahinul.tech>',
    to: user.email,
    subject: "Your FoodHub phone verification code",
    html: `<div style="margin:0;padding:24px 12px;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <tr>
      <td style="background:linear-gradient(135deg,#fb923c,#ea580c);background-color:#ea580c;padding:28px 24px;text-align:center;">
        <p style="margin:0;font-size:40px;line-height:1;">📱</p>
        <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#ffffff;">FoodHub</p>
        <p style="margin:4px 0 0;font-size:13px;color:#ffedd5;">Phone verification</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;text-align:center;">
        <p style="margin:0 0 16px;font-size:14px;color:#57534e;">
          Use this code to verify your phone number <b>${user.phone}</b>:
        </p>
        <p style="margin:0;display:inline-block;padding:14px 28px;background-color:#fff7ed;border:1px dashed #fb923c;border-radius:10px;font-size:30px;font-weight:bold;letter-spacing:8px;color:#ea580c;">${otp}</p>
        <p style="margin:16px 0 0;font-size:12px;color:#a8a29e;">This code expires in 5 minutes. If you didn't request it, you can ignore this email.</p>
      </td>
    </tr>
  </table>
</div>`,
  });

  return { message: "A verification code has been sent to your email" };
};

const verifyOtp = async (userId: string, otp: string) => {
  if (!otp || typeof otp !== "string") {
    throw new Error("OTP is required");
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.phoneVerified) {
    return { message: "Phone number is already verified" };
  }
  if (!user.phoneOtp || !user.phoneOtpExpires) {
    throw new Error("Request a verification code first");
  }
  if (user.phoneOtpExpires < new Date()) {
    throw new Error("This code has expired. Please request a new one");
  }
  if (hashOtp(otp.trim()) !== user.phoneOtp) {
    throw new Error("Invalid code. Please try again");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { phoneVerified: true, phoneOtp: null, phoneOtpExpires: null },
  });

  return { message: "Phone number verified successfully" };
};

export const phoneService = { sendOtp, verifyOtp };