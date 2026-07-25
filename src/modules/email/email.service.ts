import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 587,  //587 secure false   ... 465 secure true 
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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