// File: src/routes/orders.ts
import { Router } from "express";

const router = Router();
export const orders: any[] = []; // Export orders so feedback route can modify it

// Add order
router.post("/", (req, res) => {
  const order = {
    id: Date.now().toString(),
    status: "completed",
    ...req.body
  };
  orders.push(order);
  res.json(order);
});

// Get all orders (optional ?table filter)
router.get("/", (req, res) => {
  const { table } = req.query;
  let result = orders;

  if (typeof table === "string" && table.trim()) {
    result = orders.filter((o) => o.tableNum === table.trim());
  }

  const sorted = [...result].sort(
    (a, b) =>
      new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()
  );

  res.json(sorted);
});

export default router;


