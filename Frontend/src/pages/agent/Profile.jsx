import { useState } from "react";

export default function AgentProfile() {
  const [available, setAvailable] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">
          Agent Profile
        </h1>

        <p className="section-sub">
          Manage your profile and availability
        </p>
      </div>

      <div className="card p-6">
        <div className="space-y-4">

          <div>
            <label className="label">
              Name
            </label>

            <input
              className="input"
              value="Delivery Agent"
              readOnly
            />
          </div>

          <div>
            <label className="label">
              Email
            </label>

            <input
              className="input"
              value="agent@lastmile.com"
              readOnly
            />
          </div>

          <div className="flex items-center justify-between border border-white/10 rounded-lg p-4">
            <span className="text-slate-300">
              Available For Assignment
            </span>

            <button
              onClick={() => setAvailable(!available)}
              className={
                available
                  ? "btn-primary"
                  : "btn-danger"
              }
            >
              {available ? "Available" : "Unavailable"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}