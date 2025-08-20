import { Router } from "express";
import otpGenerator from "otp-generator";
import crypto from "crypto";

const router = Router();
const otpStore: Record<string, { otp: string; expires: number }> = {};
const activeSessions: Record<string, { phone: string }> = {};

// Send OTP
router.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: "Phone number required" });

  const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });
  otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  console.log(`Generated OTP for ${phone}: ${otp}`); // Replace with SMS API

  res.json({ success: true, message: "OTP sent" });
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ success: false, message: "Phone and OTP required" });

  const record = otpStore[phone];
  if (!record) return res.status(400).json({ success: false, message: "No OTP found" });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });

  // Create session token
  const sessionToken = crypto.randomBytes(16).toString("hex");
  activeSessions[sessionToken] = { phone };

  delete otpStore[phone];

  res.json({ success: true, token: sessionToken, phone });
});

// Check session validity
router.get("/check-session", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token && activeSessions[token]) {
    return res.json({ success: true, phone: activeSessions[token].phone });
  }
  res.status(401).json({ success: false, message: "Invalid session" });
});
export default router;
