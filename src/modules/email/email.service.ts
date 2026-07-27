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
  time: string,
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
      from: '"FoodHub" <hello@mahinul.tech>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Login alert email error:", error);
  }
};

function buildOrderConfirmationHtml(
  name: string,
  orderId: string,
  totalPrice: number,
) {
  return `
<div style="margin:0;padding:24px 12px;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <tr>
      <td style="background:linear-gradient(135deg,#fb923c,#ea580c);background-color:#ea580c;padding:32px 24px;text-align:center;">
        <p style="margin:0;font-size:44px;line-height:1;">🍜</p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">FoodHub</p>
        <p style="margin:4px 0 0;font-size:13px;color:#ffedd5;">Order confirmed</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#1c1917;">Thanks, ${name}! 🎉</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#57534e;">
          Your order has been placed successfully. Here's a quick summary:
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;color:#44403c;background-color:#fafaf9;border-radius:10px;border:1px solid #f0efed;">
          <tr>
            <td style="padding:10px 16px;font-weight:bold;width:130px;">Order ID</td>
            <td style="padding:10px 16px;word-break:break-all;">${orderId}</td>
          </tr>
          
          <tr>
            <td style="padding:10px 16px;font-weight:bold;">Total Amount</td>
            <td style="padding:10px 16px;">৳${totalPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;font-weight:bold;">Status</td>
            <td style="padding:10px 16px;">Placed</td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#57534e;">
          We'll notify you again once your order is on its way. You can track it anytime from your dashboard.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background-color:#fafaf9;border-top:1px solid #f5f5f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#a8a29e;">FoodHub &middot; Fresh meals, delivered to your door</p>
      </td>
    </tr>
  </table>
</div>`;
}

async function sendOrderConfirmation(
  email: string,
  name: string,
  orderId: string,
  totalPrice: number,
) {
  try {
    const info = await transporter.sendMail({
      from: `"FoodHub" <hello@mahinul.tech>`,
      to: email,
      subject: `Order Confirmed — #${orderId.slice(0, 8)}`,
      html: buildOrderConfirmationHtml(name, orderId, totalPrice),
    });

    console.log("✅ Order confirmation email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Order confirmation email failed:", err);
  }
}

const statusMeta: Record<
  string,
  { emoji: string; title: string; message: string; color: string }
> = {
  PLACED: {
    emoji: "🧾",
    title: "Order Placed",
    message: "We've received your order and it's being processed.",
    color: "#ea580c",
  },

  PREPARING: {
    emoji: "👨‍🍳",
    title: "Preparing Your Order",
    message: "Your meal is being freshly prepared right now.",
    color: "#0891b2",
  },

  DELIVERED: {
    emoji: "📦",
    title: "Order Delivered",
    message: "Your order has been delivered. Enjoy your meal!",
    color: "#16a34a",
  },
  CANCELLED: {
    emoji: "❌",
    title: "Order Cancelled",
    message:
      "Your order has been cancelled. If this was unexpected, please contact support.",
    color: "#dc2626",
  },
};

function buildOrderStatusHtml(name: string, orderId: string, status: string) {
  const meta = statusMeta[status] || {
    emoji: "📬",
    title: "Order Update",
    message: "There's an update on your order.",
    color: "#ea580c",
  };

  return `
<div style="margin:0;padding:24px 12px;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <tr>
      <td style="background-color:${meta.color};padding:32px 24px;text-align:center;">
        <p style="margin:0;font-size:44px;line-height:1;">${meta.emoji}</p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">FoodHub</p>
        <p style="margin:4px 0 0;font-size:13px;color:#ffffffcc;">${meta.title}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#1c1917;">Hi ${name},</h1>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#57534e;">
          ${meta.message}
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;color:#44403c;background-color:#fafaf9;border-radius:10px;border:1px solid #f0efed;">
          <tr>
            <td style="padding:10px 16px;font-weight:bold;width:130px;">Order ID</td>
            <td style="padding:10px 16px;word-break:break-all;">${orderId}</td>
          </tr>
         
          <tr>
            <td style="padding:10px 16px;font-weight:bold;">Status</td>
            <td style="padding:10px 16px;">${status}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background-color:#fafaf9;border-top:1px solid #f5f5f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#a8a29e;">FoodHub &middot; Fresh meals, delivered to your door</p>
      </td>
    </tr>
  </table>
</div>`;
}

async function sendOrderStatus(
  email: string,
  name: string,
  orderId: string,
  status: string,
) {
  try {
    const meta = statusMeta[status];
    const info = await transporter.sendMail({
      from: `"FoodHub" <hello@mahinul.tech>`,
      to: email,
      subject: `${meta?.title || "Order Update"} — #${orderId.slice(0, 8)}`,
      html: buildOrderStatusHtml(name, orderId, status),
    });

    console.log("✅ Order status email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Order status email failed:", err);
  }
}

export const emailService = {
  sendLoginAlert,
  sendOrderConfirmation,
  sendOrderStatus, // 👈 নতুন export যোগ করুন
};
