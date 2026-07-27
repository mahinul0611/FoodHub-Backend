import { ComplaintCategory, ComplaintStatus } from "../../../generated/prisma/enums";
import { transporter } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const FROM = '"BiteBear" <noreply@mahinulislam2208054.me>';

const createComplaint = async (
  userId: string,
  payload: { orderId: string; category: string; description: string },
) => {
  const { orderId, category, description } = payload;

  if (!orderId) throw new Error("orderId is required!");
  if (
    !Object.values(ComplaintCategory).includes(category as ComplaintCategory)
  ) {
    throw new Error("Invalid complaint category!");
  }
  if (!description || description.trim().length < 10) {
    throw new Error("Please describe the issue in at least 10 characters!");
  }

  // ⚠️ Model/relation name gula tomar order service theke copy koro —
  // jevabe order fetch koro items + meals soho, exact sei include
  const order = await prisma.orders.findUnique({
  where: { id: orderId },
  include: {
    provider: true,
    orderItems: { include: { meals: { include: { provider: true } } } },
  },
});
  if (!order) throw new Error("Order not found!");
  if (order.userId !== userId) {
    throw new Error("You can only report your own orders!");
  }

  const existing = await prisma.complaint.findFirst({ where: { orderId } });
  if (existing) {
    throw new Error("You have already reported an issue for this order!");
  }

  // ⚠️ meal er provider field er nam tomar schema onujayi adjust koro
  // Restaurant er USER id (ProvidersProfile.userId) — email + provider dashboard er jonno
const providerProfile =
  order.provider ?? order.orderItems[0]?.meals?.provider;
const providerUserId = providerProfile?.userId;
if (!providerUserId) {
  throw new Error("Could not find the restaurant for this order!");
}

  const complaint = await prisma.complaint.create({
    data: {
      orderId,
      userId,
      providerId: providerUserId,
      category: category as ComplaintCategory,
      description: description.trim(),
    },
  });

  // Restaurant + admin ke email (best-effort — fail korleo complaint create hobe)
  try {
    const [customer, provider, admin] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: providerUserId  } }),
      prisma.user.findFirst({ where: { role: "ADMIN" } }),
    ]);
    const to = [provider?.email, admin?.email].filter(Boolean).join(", ");
    if (to) {
      const shortId = orderId.slice(0, 8);
      await transporter.sendMail({
        from: FROM,
        to,
        subject: `New complaint for order #${shortId}`,
        text: `${customer?.name ?? "A customer"} reported an issue with order #${shortId}.\n\nCategory: ${category}\n\n${description.trim()}\n\nPlease review it from your BiteBear dashboard.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#ea580c;">New order complaint</h2>
            <p><strong>${customer?.name ?? "A customer"}</strong> reported an issue with order <strong>#${shortId}</strong>.</p>
            <p><strong>Category:</strong> ${category}</p>
            <div style="border:1px solid #e5e5e5;border-radius:8px;padding:12px;background:#fafafa;">
              ${description.trim()}
            </div>
            <p style="margin-top:16px;">Please review it from your BiteBear dashboard.</p>
          </div>`,
      });
    }
  } catch (error) {
    console.error("Complaint notification email failed:", error);
  }

  return complaint;
};

// Frontend e customer/restaurant er nam dekhanor jonno user info attach kori
const attachUsers = async (
  complaints: Array<{ userId: string; providerId: string }>,
) => {
  const ids = [...new Set(complaints.flatMap((c) => [c.userId, c.providerId]))];
  const [users, profiles] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, email: true },
    }),
    prisma.providersProfile.findMany({
      where: { OR: [{ userId: { in: ids } }, { id: { in: ids } }] },
      select: { id: true, userId: true, name: true, email: true },
    }),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const profileByKey = new Map<string, (typeof profiles)[number]>();
  for (const profile of profiles) {
    profileByKey.set(profile.userId, profile);
    profileByKey.set(profile.id, profile);
  }
  return complaints.map((c) => {
    const profile = profileByKey.get(c.providerId);
    return {
      ...c,
      user: userById.get(c.userId) ?? null,
      provider: profile
        ? { id: c.providerId, name: profile.name, email: profile.email }
        : (userById.get(c.providerId) ?? null),
    };
  });
};

const getMyComplaints = (userId: string) =>
  prisma.complaint.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

const getProviderComplaints = async (providerId: string) =>
  attachUsers(
    await prisma.complaint.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
    }),
  );

const getAllComplaints = async () =>
  attachUsers(
    await prisma.complaint.findMany({ orderBy: { createdAt: "desc" } }),
  );

const updateComplaint = async (
  actor: { id: string; role: string },
  complaintId: string,
  payload: { status?: string; resolution?: string },
) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
  });
  if (!complaint) throw new Error("Complaint not found!");

  const isAdmin = actor.role === "ADMIN";
  if (!isAdmin && complaint.providerId !== actor.id) {
    throw new Error("You can only manage complaints for your own restaurant!");
  }
  if (
    payload.status &&
    !Object.values(ComplaintStatus).includes(payload.status as ComplaintStatus)
  ) {
    throw new Error("Invalid complaint status!");
  }

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      ...(payload.status
        ? { status: payload.status as ComplaintStatus }
        : {}),
      ...(typeof payload.resolution === "string"
        ? { resolution: payload.resolution.trim() || null }
        : {}),
    },
  });

  // Resolve/reject hole customer ke janai (best-effort)
  if (
    payload.status &&
    ["RESOLVED", "REJECTED"].includes(payload.status) &&
    payload.status !== complaint.status
  ) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: complaint.userId },
      });
      if (customer?.email) {
        const shortId = complaint.orderId.slice(0, 8);
        await transporter.sendMail({
          from: FROM,
          to: customer.email,
          subject: `Update on your complaint for order #${shortId}`,
          text: `Your complaint for order #${shortId} has been ${payload.status.toLowerCase()}.${updated.resolution ? `\n\nResponse: ${updated.resolution}` : ""}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
              <h2 style="color:#ea580c;">Complaint ${payload.status === "RESOLVED" ? "resolved" : "update"}</h2>
              <p>Your complaint for order <strong>#${shortId}</strong> has been <strong>${payload.status.toLowerCase()}</strong>.</p>
              ${updated.resolution ? `<div style="border:1px solid #e5e5e5;border-radius:8px;padding:12px;background:#fafafa;">${updated.resolution}</div>` : ""}
              <p style="margin-top:16px;">Thank you for helping us improve BiteBear.</p>
            </div>`,
        });
      }
    } catch (error) {
      console.error("Complaint resolution email failed:", error);
    }
  }

  return updated;
};

export const complaintService = {
  createComplaint,
  getMyComplaints,
  getProviderComplaints,
  getAllComplaints,
  updateComplaint,
};