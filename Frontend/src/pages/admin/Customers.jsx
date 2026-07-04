import { useState } from "react";
import {
  RiSearchLine,
  RiUserLine,
  RiMailLine,
  RiPhoneLine,
  RiFileList3Line,
  RiAddCircleLine,
  RiUserUnfollowLine,
} from "react-icons/ri";

export default function Customers() {
  const [search, setSearch] = useState("");

  const customers = [
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      phone: "+91 9876543210",
      orders: 12,
      status: "Active",
    },
    {
      id: 2,
      name: "Aman Singh",
      email: "aman@gmail.com",
      phone: "+91 9988776655",
      orders: 8,
      status: "Active",
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Customer Management</h1>
        <p className="section-sub">
          View and manage all registered customers.
        </p>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-3 text-slate-400 text-lg" />

          <input
            type="text"
            className="input pl-10"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid gap-4">
        {filtered.map((customer) => (
          <div key={customer.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <RiUserLine />
                  {customer.name}
                </h3>

                <p className="text-slate-400 flex items-center gap-2 mt-2">
                  <RiMailLine />
                  {customer.email}
                </p>

                <p className="text-slate-400 flex items-center gap-2 mt-1">
                  <RiPhoneLine />
                  {customer.phone}
                </p>
              </div>

              <span className="badge-delivered">
                {customer.status}
              </span>
            </div>

            {/* Orders Count */}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
              <span className="text-slate-400">
                Orders Placed
              </span>

              <span className="text-gold-500 font-semibold">
                {customer.orders}
              </span>
            </div>

            {/* Admin Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="btn-secondary"
                onClick={() => alert(`View Orders of ${customer.name}`)}>
                    <RiFileList3Line />
                View Orders
              </button>

              <button className="btn-primary" onClick={() => alert(`Create Order for ${customer.name}`)}>
                <RiAddCircleLine />
                Create Order
              </button>

              <button className="btn-danger"
                  onClick={() => alert(`Deactivate ${customer.name}`)}>
                     <RiUserUnfollowLine />
                 Deactivate
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}