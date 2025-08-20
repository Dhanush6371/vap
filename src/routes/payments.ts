import { Router } from "express";

const router = Router();

// Simulate payment
router.post("/", (req, res) => {
  const { amount } = req.body;
  // In a real case, integrate payment gateway
  res.json({ success: true, message: "Payment successful", amount });
});

export default router;
