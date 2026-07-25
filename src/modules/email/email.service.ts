import nodemailer from "nodemailer";
import { prisma } from "../../lib/prisma";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.APP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.APP_PASSWORD,
  },
});

// ১. লগইন অ্যালার্ট পাঠানো এবং Prisma দিয়ে LoginHistory সেভে রাখা
const sendLoginAlert = async (
  userId: string,
  email: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  time: string,
) => {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        device: userAgent,
      },
    });

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
  try {
    const subject = `Order Confirmed! 🎉 (Order ID: #${orderId.slice(0, 8)})`;
    const html = `<p>Yay, ${userName}! Your order #${orderId.slice(0, 8)} of ${totalAmount} BDT is confirmed and being prepared.</p>`;

    await transporter.sendMail({
      from: `"FoodHub Orders" <${process.env.APP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Order confirmation email error:", error);
  }
};

// ৩. অর্ডার স্ট্যাটাস / ডেলিভারি আপডেট মেইল
const sendOrderStatus = async (
  to: string,
  userName: string,
  orderId: string,
  status: string,
) => {
  try {
    const subject = `Update on your FoodHub Order #${orderId.slice(0, 8)}`;
    const html = `<p>Hi ${userName}, your order #${orderId.slice(0, 8)} status is now: <strong>${status}</strong>.</p>`;

    await transporter.sendMail({
      from: `"FoodHub Orders" <${process.env.APP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Order status email error:", error);
  }
};

export const emailService = {
  sendLoginAlert,
  sendOrderConfirmation,
  sendOrderStatus,
};