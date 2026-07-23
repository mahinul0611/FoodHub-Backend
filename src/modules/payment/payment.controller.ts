import { Request, Response } from "express";
import { paymentService } from "./payment.service";

const FRONTEND_URL =
  process.env.APP_URL ?? "https://food-hub-frontend-flame.vercel.app";

const init = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { method } = req.body ?? {};
    const result =
      method === "STRIPE"
        ? await paymentService.initStripePayment(user.id, req.body.orderId)
        : await paymentService.initPayment(user.id, req.body.orderId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not start payment",
      error: error.message,
    });
  }
};

const success = async (req: Request, res: Response) => {
  try {
    const orderId = await paymentService.handleSuccess(req.body);
    if (orderId) {
      return res.redirect(`${FRONTEND_URL}/payment/success?orderId=${orderId}`);
    }
    return res.redirect(`${FRONTEND_URL}/payment/failed`);
  } catch {
    return res.redirect(`${FRONTEND_URL}/payment/failed`);
  }
};

const fail = async (req: Request, res: Response) => {
  try {
    await paymentService.handleFailure(req.body, false);
  } catch (error) {
    console.error("Payment fail handler error:", error);
  }
  return res.redirect(`${FRONTEND_URL}/payment/failed`);
};

const cancel = async (req: Request, res: Response) => {
  try {
    await paymentService.handleFailure(req.body, true);
  } catch (error) {
    console.error("Payment cancel handler error:", error);
  }
  return res.redirect(`${FRONTEND_URL}/payment/failed?reason=cancelled`);
};

// IPN = SSLCommerz er server-to-server confirmation (browser redirect miss holeo eta ashe)
const ipn = async (req: Request, res: Response) => {
  try {
    await paymentService.handleSuccess(req.body);
  } catch (error) {
    console.error("Payment IPN handler error:", error);
  }
  res.status(200).send("OK");
};

const stripeSuccess = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id;
    const orderId =
      typeof sessionId === "string"
        ? await paymentService.handleStripeSuccess(sessionId)
        : null;
    if (orderId) {
      return res.redirect(`${FRONTEND_URL}/payment/success?orderId=${orderId}`);
    }
    return res.redirect(`${FRONTEND_URL}/payment/failed`);
  } catch {
    return res.redirect(`${FRONTEND_URL}/payment/failed`);
  }
};

const stripeCancel = async (req: Request, res: Response) => {
  try {
    const orderId = req.query.orderId;
    if (typeof orderId === "string") {
      await paymentService.handleStripeCancel(orderId);
    }
  } catch {
    // best-effort
  }
  return res.redirect(`${FRONTEND_URL}/payment/failed?reason=cancelled`);
};

export const paymentController = {
  init,
  success,
  fail,
  cancel,
  ipn,
  stripeCancel,
  stripeSuccess,
};
