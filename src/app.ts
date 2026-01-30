import { toNodeHandler } from "better-auth/node";
import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";

import cors from "cors"


const app: Application = express();


app.use(cors(
  {
    origin: process.env.APP_URL || "http://localhost:3000", //Client Side ba frontendt URL 
    credentials:true  // Betterauth cookies alada kore set kore rakhtese tai true kore diyechi
  }
))
app.use(express.json());


app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Server");
});

export default app;
