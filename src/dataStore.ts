import { Order } from "./types";

// In-memory storage (replace with DB later)
export const lockedTables = new Set<string>();
export const orders: Order[] = [];


