import { Request, Response } from "express";
import { providerService } from "./provider.service";
import { prisma } from "../../lib/prisma";

const getAllProvider = async (req: Request, res: Response) => {
  try {
    const result = await providerService.getAllProvider();

    res.status(200).json({
      success: true,
      message: "Provider fetched Successfuly",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Provider Fetching failed",
    });
  }
};

const getProviderOrder = async (req: Request, res: Response) => {
  try {
    // const user= req.user

    const providerId = (req as any).user.id as string;
    // console.log(req)

    const providerProfile = await prisma.providersProfile.findUnique({
      where: { userId: providerId },
    });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found ",
      });
    }

    const result = await providerService.getProviderOrder(providerProfile.id);

    res.status(200).json({
      success: true,
      message: "Provider orders fetched Successfuly",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Provider order Fetching failed",
    });
  }
};

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const providerUserId = (req as any).user?.id;

    const providerProfile = await prisma.providersProfile.findUniqueOrThrow({
      where: {
        userId:providerUserId
      },
    });

    if (!providerProfile) {
      return res.status(403).json({ success: false, message: "Provider Profile Not Found" });
    }
    // console.log({ req });

    const { orderId } = req.params as any;
    // console.log(orderId)
    const { status } = req.body;
    // console.log(status);

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { meals: true } } },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order Not Found" });
    }

    const isOwnOrder = order.orderItems.some(
      (item) => item.meals.providerId === providerProfile.id,
    );
    if (!isOwnOrder) {
      return res
        .status(403)
        .json({
          success: false,
          message:
            "Unauthorized: This order contains items from another provider",
        });
    }

    // console.log({ req });

    const result = await providerService.updateOrderStatus(orderId, status);

    res.status(200).json({
      success: true,
      message: " Order Status updated Successfuly",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Order status Update failed",
    });
  }
};

const updateProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Service call kora hocche
    const result = await providerService.updateProfile(id as string, updatedData);

    return res.status(200).json({
      success: true,
      message: "Provider profile updated successfully",
      data: result,
    });
  } catch (err: any) {
    // Kono error asle backend crash korbe na, frontend e error message pathabe
    return res.status(400).json({
      success: false,
      message: "Failed to update profile",
      error: err.message || err,
    });
  }
};

export const providerController = {
  getAllProvider,
  getProviderOrder,
  updateOrderStatus,
  updateProfile,
};
