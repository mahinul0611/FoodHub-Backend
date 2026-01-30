import { toNodeHandler } from "better-auth/node";
import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";

import cors from "cors"
import { mealsRouter } from "./modules/meals/meals.route";
import errorHandler from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { categoryRouter } from "./modules/category/category.route";
import { providerRouter } from "./modules/provider/provider.route";


const app: Application = express();


app.use(cors(
  {
    origin: process.env.APP_URL || "http://localhost:3000", //Client Side ba frontendt URL 
    credentials:true  // Betterauth cookies alada kore set kore rakhtese tai true kore diyechi
  }
))
app.use(express.json());


app.all("/api/auth/*splat", toNodeHandler(auth));

// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello from Server");
// });

app.use("/category",categoryRouter)
app.use("/meals",mealsRouter)

app.use("/provider",providerRouter)


app.use(notFound)
app.use(errorHandler)

export default app;
