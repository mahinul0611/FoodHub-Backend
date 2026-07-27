import { PaymentStatus, OrdersStatus } from "../../../generated/prisma/enums"; // OrdersStatus-ও ইম্পোর্ট করে নিন
import { prisma } from "../../lib/prisma";
import Stripe from "stripe";
import { emailService } from "../email/email.service";
// ইমেইল সার্ভিসটি আপনার সঠিক পাথ অনুযায়ী ইম্পোর্ট করে নেবেন
// import { emailService } from "../../email/email.service"; 

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

const SSLCZ_BASE =
  process.env.SSLCZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

const BACKEND_URL =
  process.env.BETTER_AUTH_URL ?? "https://api.mahinul.tech";

const initPayment = async (userId: string, orderId: string) => {
  if (!orderId) throw new Error("orderId is required!");

  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) throw new Error("Order not found!");
  if (order.userId !== userId) {
    throw new Error("You can only pay for your own orders!");
  }
  
  // Enum ব্যবহার করা হয়েছে
  if (order.paymentStatus === PaymentStatus.PAID) {
    throw new Error("This order is already paid!");
  }

  const tranId = `FH-${orderId.slice(0, 8)}-${Date.now()}`;

  const amount = Number(order.totalPrice);
  if (!amount || amount <= 0) throw new Error("Invalid order amount!");

  const params = new URLSearchParams({
    store_id: process.env.SSLCZ_STORE_ID ?? "",
    store_passwd: process.env.SSLCZ_STORE_PASSWD ?? "",
    total_amount: amount.toFixed(2),
    currency: "BDT",
    tran_id: tranId,
    success_url: `${BACKEND_URL}/payments/success`,
    fail_url: `${BACKEND_URL}/payments/fail`,
    cancel_url: `${BACKEND_URL}/payments/cancel`,
    ipn_url: `${BACKEND_URL}/payments/ipn`,
    shipping_method: "NO",
    product_name: "BiteBear order",
    product_category: "Food",
    product_profile: "general",
    cus_name: order.user?.name ?? "BiteBeard customer",
    cus_email: order.user?.email ?? "customer@bitebear.com",
    cus_add1: order.address ?? "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: order.contactNumber ?? "01700000000",
    value_a: orderId,
  });

  const res = await fetch(`${SSLCZ_BASE}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();

  if (data?.status !== "SUCCESS" || !data?.GatewayPageURL) {
    throw new Error(
      data?.failedreason || "Could not start the payment session!",
    );
  }

  await prisma.orders.update({
    where: { id: orderId },
    data: { paymentMethod: "SSLCOMMERZ", transactionId: tranId },
  });

  return { paymentUrl: data.GatewayPageURL };
};

const validatePayment = async (valId: string) => {
  const query = new URLSearchParams({
    val_id: valId,
    store_id: process.env.SSLCZ_STORE_ID ?? "",
    store_passwd: process.env.SSLCZ_STORE_PASSWD ?? "",
    format: "json",
  });
  const res = await fetch(
    `${SSLCZ_BASE}/validator/api/validationserverAPI.php?${query.toString()}`,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  if (data?.status === "VALID" || data?.status === "VALIDATED") return data;
  return null;
};

// SSLCommerz Success Webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSuccess = async (body: any) => {
  const orderId = body?.value_a;
  const tranId = body?.tran_id;
  const valId = body?.val_id;
  if (!orderId || !valId) return null;

  const validated = await validatePayment(String(valId));
  if (!validated) return null;

  const order = await prisma.orders.findUnique({ 
    where: { id: orderId },
    include: { user: true } // ইমেইল পাঠানোর জন্য user ডাটা নিয়ে আসা হলো
  });
  
  if (!order || order.transactionId !== tranId) return null;

  // Enum ব্যবহার করে আপডেট
  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: PaymentStatus.PAID },
  });

  // 🚀 পেমেন্ট সফল হওয়ার পর ব্যাকগ্রাউন্ডে কনফার্মেশন মেইল পাঠানো
  if (order.user?.email) {
    emailService
      .sendOrderConfirmation(
        order.user.email,
        order.user.name || "Customer",
        order.id,
        Number(updatedOrder.totalPrice)
      )
      .catch((err:any) => console.error("SSLCommerz Email Error:", err)); 
  }

  return orderId as string;
};

// SSLCommerz Failure/Cancel Webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFailure = async (body: any, cancelled: boolean) => {
  const orderId = body?.value_a;
  if (!orderId) return null;

  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) return null;
  
  // Enum ব্যবহার করা হয়েছে
  if (order.paymentStatus === PaymentStatus.PAID) return orderId as string;

  await prisma.orders.update({
    where: { id: orderId },
    data: {
      // Enum ব্যবহার করা হয়েছে
      paymentStatus: cancelled ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
      status: OrdersStatus.CANCELLED, // টাকা না দিলে অর্ডারও ক্যান্সেল (Enum)
    },
  });
  return orderId as string;
};

const initStripePayment = async (userId: string, orderId: string) => {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { user: true },
  });
  if (!order) throw new Error("Order not found!");
  if (order.userId !== userId)
    throw new Error("You can only pay for your own orders!");
    
  // Enum ব্যবহার করা হয়েছে
  if (order.paymentStatus === PaymentStatus.PAID)
    throw new Error("This order is already paid!");

  const amount = Number(order.totalPrice);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `BiteBear Order #${orderId.slice(0, 8).toUpperCase()}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    ...(order.user?.email ? { customer_email: order.user.email } : {}),
    metadata: { orderId },
    success_url: `${BACKEND_URL}/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BACKEND_URL}/payments/stripe/cancel?orderId=${orderId}`,
  });

  if (!session.url) throw new Error("Failed to create Stripe session!");

  await prisma.orders.update({
    where: { id: orderId },
    data: {
      paymentMethod: "STRIPE",
      paymentStatus: PaymentStatus.UNPAID,
      transactionId: session.id,
    },
  });

  return { paymentUrl: session.url };
};

// Stripe Success Webhook
const handleStripeSuccess = async (sessionId: string) => {
  if (!sessionId) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return null;

  const orderId = session.metadata?.orderId;
  if (!orderId) return null;

  const order = await prisma.orders.findUnique({ 
    where: { id: orderId },
    include: { user: true } // ইমেইল পাঠানোর জন্য user ডাটা নিয়ে আসা হলো
  });
  
  if (!order || order.transactionId !== session.id) return null;

  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: PaymentStatus.PAID },
  });

  // 🚀 পেমেন্ট সফল হওয়ার পর ব্যাকগ্রাউন্ডে কনফার্মেশন মেইল পাঠানো
  if (order.user?.email) {
     emailService
      .sendOrderConfirmation(
        order.user.email,
        order.user.name || "Customer",
        orderId,
        Number(updatedOrder.totalPrice)
      )
      .catch((err) => console.error("Stripe Email Error:", err));
  }

  return orderId;
};

// Stripe Cancel Webhook
const handleStripeCancel = async (orderId: string) => {
  if (!orderId) return;
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  
  // Enum ব্যবহার করা হয়েছে
  if (!order || order.paymentStatus === PaymentStatus.PAID) return;
  
  await prisma.orders.update({
    where: { id: orderId },
    data: { 
      paymentStatus: PaymentStatus.CANCELLED, 
      status: OrdersStatus.CANCELLED // Enum ব্যবহার করা হয়েছে
    },
  });
};

export const paymentService = {
  initPayment,
  handleSuccess,
  handleFailure,
  initStripePayment,
  handleStripeSuccess,
  handleStripeCancel,
};