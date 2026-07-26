import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APIError } from "better-auth/api";
import nodemailer from "nodemailer";
import { emailController } from "../modules/email/email.controller";
import { emailService } from "../modules/email/email.service";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
}

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.APP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.APP_PASSWORD,
  },
});

// Production e ekbar console e dekhabe smt on hoise kina??
if (process.env.SMTP_VERIFY_ON_START === "true") {
  transporter.verify((err, success) => {
    if (err) console.error("SMTP verify failed:", err);
    else console.log("SMTP ready:", success);
  });
}


export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://mahinul.netlify.app",
    "https://www.mahinul.tech",
    "https://mahinul.tech",
    "http://localhost:3000",
    "https://www.mahinul.netlify.app",
    process.env.APP_URL,
  ].filter(Boolean) as string[],
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
      phoneVerified: {
        type: "boolean",
        defaultValue: false,
        required: false,
        input: false,
      },
    },
  },

 databaseHooks: {
  session: {
    create: {
      after: async (session) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true, name: true },
          });

          if (user && user.email) {
            const ipAddress = session.ipAddress || "Unknown IP";
            const userAgent = session.userAgent || "Unknown Device/Browser";
            const time = new Date().toLocaleString();

            // fire-and-forget — login response block করবে না
            emailService.sendLoginAlert(
              user.email,
              user.name || "Customer",
              ipAddress,
              userAgent,
              time,
            );
          }
        } catch (error) {
          console.error("❌ Login session hook error:", error);
        }
      },
    },
  },
},
  // trustedOrigins: [process.env.APP_URL!],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const link =
        process.env.APP_URL && process.env.BETTER_AUTH_URL
          ? url.replace(
              process.env.BETTER_AUTH_URL,
              `${process.env.APP_URL}/backend-api`,
            )
          : url;

      try {
        const info = await transporter.sendMail({
          from: '"FoodHub" <hello@mahinul.tech>',
          to: user.email,
          subject: "Reset your FoodHub password",
          html: `
<div style="margin:0;padding:24px 12px;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <tr>
      <td style="background:linear-gradient(135deg,#fb923c,#ea580c);background-color:#ea580c;padding:32px 24px;text-align:center;">
        <p style="margin:0;font-size:44px;line-height:1;">🔑</p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">FoodHub</p>
        <p style="margin:4px 0 0;font-size:13px;color:#ffedd5;">Password reset request</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#1c1917;">Hi ${user.name || "there"},</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#57534e;">
          We received a request to reset your FoodHub password.
          Click the button below to choose a new one.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center">
              <a href="${link}" style="display:inline-block;background-color:#ea580c;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:10px;">
                🔒 Reset my password
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a8a29e;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${link}" style="color:#ea580c;word-break:break-all;">${link}</a>
        </p>
        <p style="margin:16px 0 0;padding:12px;background-color:#fef3c7;border-radius:8px;font-size:12px;line-height:1.5;color:#92400e;">
          ⚠️ If you didn't request a password reset, you can safely ignore this email — your password will stay unchanged.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background-color:#fafaf9;border-top:1px solid #f5f5f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#a8a29e;">FoodHub &middot; Fresh meals, delivered to your door</p>
      </td>
    </tr>
  </table>
</div>`,
        });
        console.log("Reset password email sent:", info.messageId);
      } catch (err) {
        console.log("Reset password email sent fail", err);
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    freshAge: 0,
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url }) => {
      const link =
        process.env.APP_URL && process.env.BETTER_AUTH_URL
          ? url.replace(
              process.env.BETTER_AUTH_URL,
              `${process.env.APP_URL}/backend-api`,
            )
          : url;

      try {
        const info = await transporter.sendMail({
          from: `"FoodHub" <hello@mahinul.tech>`,
          to: user.email,
          subject: "Confirm your FoodHub account",
          html: `
<div style="margin:0;padding:24px 12px;background-color:#f5f5f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
    <tr>
      <td style="background:linear-gradient(135deg,#fb923c,#ea580c);background-color:#ea580c;padding:32px 24px;text-align:center;">
        <p style="margin:0;font-size:44px;line-height:1;">🍜</p>
        <p style="margin:8px 0 0;font-size:26px;font-weight:bold;color:#ffffff;letter-spacing:0.5px;">FoodHub</p>
        <p style="margin:4px 0 0;font-size:13px;color:#ffedd5;">Fresh meals, delivered</p>
      </td>
    </tr>
    <tr>
      <td style="padding:32px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#1c1917;">Welcome to FoodHub, ${user.name || "there"}! 🎉</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#57534e;">
          You're one step away from ordering delicious home-made meals.
          Please confirm your email address to activate your account.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center">
              <a href="${link}" style="display:inline-block;background-color:#ea580c;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 36px;border-radius:10px;">
                ✅ Verify my email
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a8a29e;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${link}" style="color:#ea580c;word-break:break-all;">${link}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background-color:#fafaf9;border-top:1px solid #f5f5f4;text-align:center;">
        <p style="margin:0;font-size:11px;color:#a8a29e;">
          You received this email because you signed up on FoodHub.<br/>
          If this wasn't you, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</div>`,
        });
        console.log(
          "Verification email sent:",
          info.messageId,
          "| host:",
          process.env.SMTP_HOST || "gmail-fallback",
          "| response:",
          info.response,
        );
      } catch (err) {
        console.log("Verification email sent fail", err);
      }
    },

    // sendVerificationEmail: async ({ user, url }) => {
    //     try {
    //         const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    //             method: "POST",
    //             headers: {
    //                 "api-key": process.env.BREVO_API_KEY as string,
    //                 "content-type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 sender: { name: "FoodHub", email: "tomar-gmail@gmail.com" },
    //                 to: [{ email: user.email }],
    //                 subject: "Verify your FoodHub email",
    //                 htmlContent: `<p>Welcome to FoodHub! Click the link to verify your email:</p><p><a href="${url}">Verify email</a></p>`,
    //             }),
    //         });
    //         const body = await res.text();
    //         if (!res.ok) {
    //             console.log("Brevo email failed:", res.status, body);
    //         } else {
    //             console.log("Brevo email sent:", body);
    //         }
    //     } catch (err) {
    //         console.log("Verification email sent fail", err);
    //     }
    // },
  },
});
