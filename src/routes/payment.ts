// File: src/routes/payment.ts
import { Router } from "express";

const router = Router();

// POST /api/simulate-payment
router.post("/simulate-payment", (_req, res) => {
  // Here you can later integrate with real payment API
  return res.json({
    success: true,
    message: "Payment simulated successfully",
    transactionId: "TXN-" + Date.now(),
  });
});

export default router;
