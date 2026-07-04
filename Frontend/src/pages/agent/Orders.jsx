import { useState } from "react";

export default function AgentOrders() {
  const [orders] = useState([
    {
      id: "ORD001",
      customer: "Rahul Kumar",
      status: "Assigned",
      address: "Noida Sector 142"
    },
    {
      id: "ORD002",
      customer: "Aman Singh",
      status: "In Transit",
      address: "Kanpur"
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">My Orders</h1>
        <p className="section-sub">
          Orders assigned to you
        </p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-5">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  {order.id}
                </h3>

                <p className="text-slate-400 text-sm">
                  {order.customer}
                </p>

                <p className="text-slate-500 text-sm">
                  {order.address}
                </p>
              </div>

              <span className="badge-confirmed">
                {order.status}
              </span>
            </div>

            <div className="mt-4">
              <select className="input">
                <option>Picked Up</option>
                <option>In Transit</option>
                <option>Out For Delivery</option>
                <option>Delivered</option>
                <option>Failed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}