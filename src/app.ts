import { toNodeHandler } from "better-auth/node";
import express, { Application  } from "express";
import { auth } from "./lib/auth";

import cors from "cors"
import { mealsRouter } from "./modules/meals/meals.route";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoryRouter } from "./modules/category/category.route";
import { providerRouter } from "./modules/provider/provider.route";
import { orderRouter } from "./modules/orders/order.route";
import { adminRouter } from "./modules/admins/admin.route";
import { meRouter } from "./modules/me/me.route";


const app: Application = express();


app.use(cors(
  {
    origin: process.env.APP_URL || "http://localhost:3000", 
    credentials:true  // 
  }
))
app.use(express.json());


app.all("/api/auth/*splat", toNodeHandler(auth));

// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello from Server");
// });

app.use("/admin",adminRouter)

app.use("/me",meRouter)


app.use("/category",categoryRouter)
app.use("/meals",mealsRouter)

app.use("/provider",providerRouter)

app.use("/orders",orderRouter)


app.use(notFound)
app.use(errorHandler)

export default app;
