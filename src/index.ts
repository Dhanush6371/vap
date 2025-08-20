// File: src/index.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import menuRoutes from "./routes/menu";
import tableRoutes from "./routes/tables";
import orderRoutes from "./routes/orders";
import feedbackRoutes from "./routes/feedback";
import paymentRoutes from "./routes/payments";

const app = express();
const PORT = process.env.PORT || 5173
    ;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/menu", menuRoutes);
app.use("/api", tableRoutes); // includes lockTable & releaseTable
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


