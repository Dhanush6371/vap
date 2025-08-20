import { Router } from "express";

const router = Router();
const lockedTables = new Set<string>();

// Lock table
router.post("/lockTable", (req, res) => {
  const { table } = req.body;
  if (!table) return res.status(400).json({ error: "Table number required" });

  if (lockedTables.has(table)) {
    return res.json({ success: false, message: "Table already locked" });
  }

  lockedTables.add(table);
  res.json({ success: true });
});

// Release table
router.post("/releaseTable", (req, res) => {
  const { table } = req.body;
  if (table && lockedTables.has(table)) {
    lockedTables.delete(table);
  }
  res.json({ success: true });
});

export default router;

