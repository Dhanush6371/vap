import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { Check, Clock, Truck } from "lucide-react";

type Order = {
  id: string;
  tableNum: string;
  dishes: Array<{ id: number; name: string; price: string; quantity: number; image: string }>;
  total: string;
  orderTime: string;
  feedback?: string;
  status: "completed" | "preparing" | "delivered";
};

const BACKEND_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const OrdersPage: React.FC = () => {
  const { orders: localOrders, updateOrderFeedback } = useCart();
  const [serverOrders, setServerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [draftFeedback, setDraftFeedback] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${BACKEND_BASE}/orders`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Order[];
        setServerOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const orders: Order[] = useMemo(() => {
    const map = new Map<string, Order>();
    [...serverOrders, ...localOrders].forEach((o: any) => {
      map.set(o.id, o);
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()
    );
  }, [serverOrders, localOrders]);

  const statusIcon = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "preparing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "delivered":
        return <Truck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const submitFeedback = async (orderId: string) => {
    try {
      const text = (draftFeedback[orderId] || "").trim();
      setSubmitting((s) => ({ ...s, [orderId]: true }));
      await updateOrderFeedback(orderId, text);
      setServerOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, feedback: text } : o))
      );
      setDraftFeedback((d) => ({ ...d, [orderId]: "" }));
      alert("Feedback saved. Thanks!");
    } catch {
      alert("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting((s) => ({ ...s, [orderId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F3F1]">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4">Order History</h1>

        {loading && (
          <div className="bg-white p-4 rounded-lg shadow">Loading orders…</div>
        )}
        {err && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-3">
            {err}
          </div>
        )}

        {orders.length === 0 && !loading ? (
          <div className="text-center bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new Date(order.orderTime).toLocaleString()}
                    </span>
                    {statusIcon(order.status)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Table: <span className="font-semibold">{order.tableNum}</span>
                    </div>
                    <span className="text-[#2A9D8F] font-bold">${order.total}</span>
                  </div>
                </div>

                <div className="space-y-3 mt-3">
                  {order.dishes.map((item) => (
                    <div key={`${order.id}-${item.id}`} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-gray-700">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t pt-3">
                  {order.feedback && order.feedback.length > 0 ? (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Your feedback:</span>{" "}
                      {order.feedback}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Leave feedback (optional)
                      </label>
                      <textarea
                        className="w-full border rounded p-2"
                        rows={2}
                        value={draftFeedback[order.id] || ""}
                        onChange={(e) =>
                          setDraftFeedback((d) => ({
                            ...d,
                            [order.id]: e.target.value,
                          }))
                        }
                        placeholder="What did you think?"
                      />
                      <button
                        onClick={() => submitFeedback(order.id)}
                        disabled={!!submitting[order.id]}
                        className="mt-2 px-4 py-2 bg-[#2A9D8F] text-white rounded disabled:opacity-50"
                      >
                        {submitting[order.id] ? "Saving…" : "Send Feedback"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;


