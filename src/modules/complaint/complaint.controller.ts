import { Request, Response } from "express";
import { complaintService } from "./complaint.service";

// ⚠️ req.user tomar onno controller e jevabe access koro sei style e adjust koro

const create = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await complaintService.createComplaint(user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not submit complaint",
      error: error.message,
    });
  }
};

const my = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await complaintService.getMyComplaints(user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not load complaints",
      error: error.message,
    });
  }
};

const provider = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.role !== "PROVIDER") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await complaintService.getProviderComplaints(user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not load complaints",
      error: error.message,
    });
  }
};

const admin = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await complaintService.getAllComplaints();
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not load complaints",
      error: error.message,
    });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!["PROVIDER", "ADMIN"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await complaintService.updateComplaint(
      { id: user.id, role: user.role },
      req.params.id,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Could not update complaint",
      error: error.message,
    });
  }
};

export const complaintController = { create, my, provider, admin, update };
