"use client";

import React, { useState } from "react";
import Link from "next/link";

enum InventoryReportType {
  Lost = "Lost",
  Damaged = "Damaged",
  Expired = "Expired",
  Stolen = "Stolen",
}

const InventoryReportPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeUser] = useState("John");

  const [formData, setFormData] = useState({
    itemName: "",
    reportType: "" as InventoryReportType,
    description: "",
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reportType) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:4000/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ProductName: formData.itemName,
          Description: `${formData.description} ${formData.additionalNotes}`,
          Quantity: 1,
          UnitPrice: 0,
          Category: formData.reportType,
          Location: "Unknown",
          Sku: "REPORT-" + Date.now(),
          Status: 2,
        }),
      });

      const result = await response.json();

      if (result.Success) {
        setShowModal(true);

        setFormData({
          itemName: "",
          reportType: "" as InventoryReportType,
          description: "",
          additionalNotes: "",
        });
      } else {
        alert(result.Message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-40">
      <header className="bg-white border-b border-slate-200 px-12 py-7 mb-20 shadow-sm">
        <nav className="text-[11px] font-black text-slate-400 flex items-center gap-4 uppercase tracking-[0.25em]">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-slate-300 font-light">{">"}</span>
          <Link
            href="/reports"
            className="hover:text-blue-600 transition-colors"
          >
            Reports
          </Link>
          <span className="text-slate-300 font-light">{">"}</span>
          <span className="text-blue-600">Inventory Report</span>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-8">
        <div className="mb-24 text-center">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-8 uppercase">
            Inventory Report
          </h1>
          <div className="h-2 w-32 bg-blue-600 mx-auto rounded-full mb-8"></div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-20">
          <form onSubmit={handleSubmit} className="space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="flex flex-col gap-8">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-8">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                  Reported By
                </label>
                <div className="w-full bg-slate-100 border-2 border-slate-100 rounded-3xl p-7 text-slate-400 font-mono text-xl flex items-center shadow-inner">
                  <span className="mr-5 text-blue-500 text-sm">👤</span>{" "}
                  {activeUser}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Report Type *
              </label>
              <select
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none text-2xl font-medium"
                value={formData.reportType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reportType: e.target.value as InventoryReportType,
                  })
                }
              >
                <option value="" disabled>
                  Select Category...
                </option>
                {Object.values(InventoryReportType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                Detailed Description *
              </label>
              <textarea
                required
                rows={7}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] ml-2">
                Additional Notes
              </label>
              <textarea
                rows={4}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 focus:bg-white outline-none transition-all text-2xl font-medium"
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, additionalNotes: e.target.value })
                }
              />
            </div>

            <div className="pt-16">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#0047AB] to-[#1E3A8A] text-white font-black py-10 rounded-[3rem] shadow-lg transition-all text-3xl uppercase tracking-[0.4em]"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl flex items-center justify-center z-50 p-6">
          <div className="bg-white p-20 rounded-[5rem] shadow-2xl max-w-2xl w-full text-center">
            <div className="text-6xl text-green-500 mb-10">✓</div>
            <h2 className="text-4xl font-black mb-6 uppercase">
              Report Submitted
            </h2>
            <p className="text-slate-500 mb-10 text-xl">
              Submitted by <span className="text-blue-600">{activeUser}</span>
            </p>

            <button
              onClick={handleReset}
              className="w-full py-6 bg-blue-700 text-white rounded-2xl font-bold"
            >
              Create Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReportPage;