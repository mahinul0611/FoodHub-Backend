import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.APP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.APP_PASSWORD,
  },
});

const sendLoginAlert = async (
  to: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  time: string
) => {
  try {
    const subject = "Security Alert: New Login to FoodHub";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e11d48;">New Login Detected</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>We noticed a new login to your FoodHub account with the following session details:</p>
        <ul style="background: #f4f4f5; padding: 15px; border-radius: 8px; list-style: none;">
          <li>📍 <strong>IP Address:</strong> ${ipAddress}</li>
          <li>💻 <strong>Device/Browser:</strong> ${userAgent}</li>
          <li>⏰ <strong>Time:</strong> ${time}</li>
        </ul>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">If this was you, you can safely ignore this email. If not, please secure your account immediately.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FoodHub Security" <${process.env.APP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Login alert email error:", error);
  }
};

export const emailService = {
  sendLoginAlert,
};