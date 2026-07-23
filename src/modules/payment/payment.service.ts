import { prisma } from "../../lib/prisma";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");


const SSLCZ_BASE =
  process.env.SSLCZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

const BACKEND_URL =
  process.env.BETTER_AUTH_URL ?? "https://foodhub-backend-7.onrender.com";

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
  if (order.paymentStatus === "PAID") {
    throw new Error("This order is already paid!");
  }

  const tranId = `FH-${orderId.slice(0, 8)}-${Date.now()}`;

  // ⚠️ IMPORTANT: totalPrice jodi poisa/cents e store kora thake (1000 = 10 taka),
  // tahole Number(order.totalPrice) / 100 koro. DB te ekta order er totalPrice
  // dekhe milau — checkout er total er sathe same number hole /100 LAGBE NA.
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
    product_name: "FoodHub order",
    product_category: "Food",
    product_profile: "general",
    cus_name: order.user?.name ?? "FoodHub customer",
    cus_email: order.user?.email ?? "customer@foodhub.com",
    cus_add1: order.address ?? "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: order.contactNumber ?? "01700000000",
    value_a: orderId, // callback e order khuje pawar jonno
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

// SSLCommerz er kach theke asha payment ke server-side validate kori (security!)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSuccess = async (body: any) => {
  const orderId = body?.value_a;
  const tranId = body?.tran_id;
  const valId = body?.val_id;
  if (!orderId || !valId) return null;

  const validated = await validatePayment(String(valId));
  if (!validated) return null;

  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order || order.transactionId !== tranId) return null;

  await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });
  return orderId as string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFailure = async (body: any, cancelled: boolean) => {
  const orderId = body?.value_a;
  if (!orderId) return null;

  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) return null;
  if (order.paymentStatus === "PAID") return orderId as string;

  await prisma.orders.update({
    where: { id: orderId },
    data: {
      paymentStatus: cancelled ? "CANCELLED" : "FAILED",
      status: "CANCELLED", // taka na dile order o cancel
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
  if (order.paymentStatus === "PAID")
    throw new Error("This order is already paid!");

  // ⚠️ initPayment (SSLCommerz) e amount jevabe ber korecho, EXACT sevabe ekhaneo
  const amount = Number(order.totalPrice);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "bdt", // jodi "currency not supported" error dey, "usd" kore daw
          product_data: {
            name: `FoodHub Order #${orderId.slice(0, 8).toUpperCase()}`,
          },
          unit_amount: Math.round(amount * 100), // taka -> poisha
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
      paymentStatus: "UNPAID",
      transactionId: session.id,
    },
  });

  return { paymentUrl: session.url };
};

const handleStripeSuccess = async (sessionId: string) => {
  if (!sessionId) return null;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return null;

  const orderId = session.metadata?.orderId;
  if (!orderId) return null;

  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order || order.transactionId !== session.id) return null;

  await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID" },
  });
  return orderId;
};

const handleStripeCancel = async (orderId: string) => {
  if (!orderId) return;
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order || order.paymentStatus === "PAID") return;
  await prisma.orders.update({
    where: { id: orderId },
    data: { paymentStatus: "CANCELLED", status: "CANCELLED" },
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