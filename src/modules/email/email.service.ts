import nodemailer from "nodemailer";
import { prisma } from "../../lib/prisma"; //

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 587, // 587 secure: false
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

// ১. লগইন অ্যালার্ট পাঠানো এবং Prisma দিয়ে LoginHistory সেভে রাখা
const sendLoginAlert = async (
  userId: string,
  email: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  time: string,
) => {
  try {
    // 🗄️ Prisma দিয়ে ডাটাবেজে লগইন হিস্ট্রি সেভ করা
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        device: userAgent,
      },
    });

    // 📧 ইমেইল পাঠানো
    const subject = "Security Alert: New Login to FoodHub";
    const html = `<p>Hello ${userName}, a new login was detected from IP: ${ipAddress} at ${time}.</p>`;

    await transporter.sendMail({
      from: `"FoodHub Security" <${process.env.APP_USER}>`,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Login alert error:", error);
  }
};

// ২. অর্ডার কনফার্মেশন মেইল
const sendOrderConfirmation = async (
  to: string,
  userName: string,
  orderId: string,
  totalAmount: number,
) => {
  const subject = `Order Confirmed! 🎉 (Order ID: #${orderId})`;
  const html = `<p>Yay, ${userName}! Your order #${orderId} of ${totalAmount} BDT is confirmed and being prepared.</p>`;

  return transporter.sendMail({
    from: `"FoodHub Orders" <${process.env.APP_USER}>`,
    to,
    subject,
    html,
  });
};

export const emailService = {
  sendLoginAlert,
  sendOrderConfirmation,
};
