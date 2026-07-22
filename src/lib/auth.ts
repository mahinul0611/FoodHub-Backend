import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APIError } from "better-auth/api";
import nodemailer from "nodemailer";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  PROVIDER = "PROVIDER",
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.APP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.APP_PASSWORD,
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    process.env.APP_URL,
    "http://localhost:3000",
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


         session: {
        create: {
            before: async (session) => {
                const user = await prisma.user.findUnique({
                    where: { id: session.userId },
                });
                if (user?.status === "SUSPEND") {
                    throw new APIError("FORBIDDEN", {
                        message: "Your account has been suspended. Contact support.",
                    });
                }
            },
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
        try {
            const info = await transporter.sendMail({
                from: '"FoodHub" <mahinulislam0611@gmail.com>',
                to: user.email,
                subject: "Reset your FoodHub password",
                html: `<p>Hi ${user.name || "there"},</p><p>Click the link below to reset your FoodHub password:</p><p><a href="${url}">Reset password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
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
    freshAge:0
  },
  advanced: {
        useSecureCookies: false, 
    },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

       sendVerificationEmail: async ({ user, url }) => {
        try {
            const info = await transporter.sendMail({
                from: `"FoodHub" <mahinulislam0611@gmail.com>`,
                to: user.email,
                subject: "Verify your FoodHub email",
                html: `<p>Welcome to FoodHub!</p><p>Click the link below to verify your email:</p><p><a href="${url}">Verify email</a></p>`,
            });
            console.log("Verification email sent:", info.messageId);
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
