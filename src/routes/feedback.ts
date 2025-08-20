import { Router } from "express";
import { orders } from "./orders"; // Import orders array from orders.ts

const router = Router();

// Save feedback for an order
router.post("/", (req, res) => {
  const { orderId, feedback } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order ID is required" });
  }

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  order.feedback = feedback || "";
  return res.json({ success: true, message: "Feedback saved", order });
});

export default router;




