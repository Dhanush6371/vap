import fs from "fs";
import path from "path";

const DATA_FILE = path.join(__dirname, "../data/data.json");

interface DataFile {
  orders: any[];
  lockedTables: string[];
}

function loadData(): DataFile {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { orders: [], lockedTables: [] };
  }
}

function saveData(data: DataFile) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getOrders() {
  return loadData().orders;
}

export function addOrder(order: any) {
  const data = loadData();
  data.orders.push(order);
  saveData(data);
}

export function updateOrder(orderId: string, updates: Partial<any>) {
  const data = loadData();
  data.orders = data.orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
  saveData(data);
}

export function getLockedTables() {
  return loadData().lockedTables;
}

export function lockTable(table: string): boolean {
  const data = loadData();
  if (data.lockedTables.includes(table)) return false;
  data.lockedTables.push(table);
  saveData(data);
  return true;
}

export function releaseTable(table: string) {
  const data = loadData();
  data.lockedTables = data.lockedTables.filter(t => t !== table);
  saveData(data);
}

