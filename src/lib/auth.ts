import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

import nodemailer from "nodemailer";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000"],
  account: {
	accountLinking: {
		enabled: true,
		trustedProviders: ["google", "facebook"],
	},
},
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: process.env.GOOGLE_REDIRECT_URI as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      redirectURI: process.env.FACEBOOK_REDIRECT_URI as string,
      	mapProfileToUser: () => ({
		emailVerified: true, // 👈 Facebook user auto-verified hobe
	}),
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },

      phone: {
        type: "string",
        required: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.role === "ADMIN") {
            throw new Error("Admin creation is not allowed!!!");
          }

          return {
            data: user,
          };
        },

        after: async (data) => {
          try {
            const user = data as any;
            const userRole = user.role;

            if (userRole === "PROVIDER") {
              console.log("Creating profile for:", user.email);

              await prisma.providersProfile.create({
                data: {
                  userId: user.id,
                  name: user.name || "New Provider",
                  email: user.email,
                },
              });
              console.log("✅ Profile created successfully!");
            }
          } catch (error) {
            console.error("❌ ERROR Creating Profile:", error);
          }
        },
      },
    },
  },
  trustedOrigins: [process.env.APP_URL!],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, 
    updateAge: 60 * 60 * 24, 
    freshAge:0
  },
  advanced: {
        useSecureCookies: false, 
    },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

        // console.log({user,url,token})

        const info = await transporter.sendMail({
          from: '"FoodHub" <foodhub@food.com>',
          to: user.email,
          subject: "Email Verification",
          // text: "Verify your email", // Plain-text version of the message
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #ff4757; padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; line-height: 1.6; color: #333333; }
    .button-container { text-align: center; margin-top: 30px; }
    .verify-button { background-color: #ff4757; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
    .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #777777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FoodHub</h1>
    </div>
    <div class="content">
      <h2>Welcome to FoodHub!</h2>
      <p>Hello,${user.name}</p>
      <p>Thank you for signing up for FoodHub. We're excited to have you join our food delivery community! To get started, please verify your email address by clicking the button below.</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="verify-button">Verify Email Address</a>
      </div>

      <p style="margin-top: 30px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #ff4757; font-size: 13px;">${verificationUrl}</p>
      
      <p>This link will expire in 24 hours. If you did not create an account, no further action is required.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 FoodHub Delivery Service. All rights reserved.</p>
      <p>Dhaka, Bangladesh</p>
    </div>
  </div>
</body>
</html>`,
        });

        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.error("Verification email sent fail",error);
      }
    },
  },
});
