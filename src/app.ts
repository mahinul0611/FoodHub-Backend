import { toNodeHandler } from "better-auth/node";
import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";

import cors from "cors";
import { mealsRouter } from "./modules/meals/meals.route";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoryRouter } from "./modules/category/category.route";
import { providerRouter } from "./modules/provider/provider.route";
import { orderRouter } from "./modules/orders/order.route";
import { adminRouter } from "./modules/admins/admin.route";
import { meRouter } from "./modules/me/me.route";
import { reviewRouter } from "./modules/reviews/review.route";
import { categoryController } from "./modules/category/category.controller";
import { phoneRoutes } from "./modules/phone/phone.route";
import { complaintRoutes } from "./modules/complaint/complaint.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { couponRoutes } from "./modules/coupon/coupon.route";
import { ChatRoutes } from "./modules/chat/chat.route";

const app: Application = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);


app.use(express.json());
app.use(express.urlencoded({ extended: true })); // SSLCommerz form-data pathay — eta MUST (already thakle skip)
app.use("/payments", paymentRoutes);
app.use("/coupons", couponRoutes);
app.use("/chat", ChatRoutes);
app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from FoodHub Server v7");
});

app.use("/admin", adminRouter);

app.use("/me", meRouter);

app.get("/category", categoryController.getAllCategory);

app.use("/admin", categoryRouter);
app.use("/meals", mealsRouter);

app.use("/provider", providerRouter);

app.use("/orders", orderRouter);
app.use("/phone", phoneRoutes);
app.use("/reviews", reviewRouter);
app.use("/complaints", complaintRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
