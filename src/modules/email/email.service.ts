import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: "support@mahinulislam2208054.me",
    pass: "M@hinul06",
  },
});

const sendLoginAlert = async (to: string, userName: string, ipAddress: string, time: string) => {
  const subject = "Security Alert: New Login to FoodHub";
  const html = `<p>Hello ${userName}, a new login was detected from IP: ${ipAddress} at ${time}.</p>`;
  
  return transporter.sendMail({ 
    from: `"FoodHub Security" <${process.env.EMAIL_USER}>`, 
    to, 
    subject, 
    html 
  });
};

const sendOrderConfirmation = async (to: string, userName: string, orderId: string, totalAmount: number) => {
  const subject = `Order Confirmed! 🎉 (Order ID: #${orderId})`;
  const html = `<p>Yay, ${userName}! Your order #${orderId} of ${totalAmount} BDT is confirmed and being prepared.</p>`;
  
  return transporter.sendMail({ 
    from: `"FoodHub Orders" <${process.env.EMAIL_USER}>`, 
    to, 
    subject, 
    html 
  });
};

const sendOrderStatus = async (to: string, userName: string, orderId: string, status: string) => {
  const subject = `Update on your FoodHub Order #${orderId}`;
  const html = `<p>Hi ${userName}, your order #${orderId} status is now: <strong>${status}</strong>.</p>`;
  
  return transporter.sendMail({ 
    from: `"FoodHub Orders" <${process.env.EMAIL_USER}>`, 
    to, 
    subject, 
    html 
  });
};

export const emailService = {
  sendLoginAlert,
  sendOrderConfirmation,
  sendOrderStatus,
};