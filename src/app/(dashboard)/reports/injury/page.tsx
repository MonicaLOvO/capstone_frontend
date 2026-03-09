"use client";

import React, { useState } from 'react';
import Link from 'next/link';

enum InjuryType {
  Fall = "Fall",
  Strain = "Strain",
  Cut = "Cut",
  Burn = "Burn",
  Equipment = "Equipment Related",
  Other = "Other",
}

const InjuryReportPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeUser] = useState("John"); 

  const [formData, setFormData] = useState({
    employeeName: '',
    injuryType: '' as InjuryType,
    description: '',
    reportDate: new Date().toISOString().split('T')[0], // Defaults to today
    location: '',
    witnesses: '',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.injuryType) return;

    setIsSubmitting(true);

    try {
      // Connects to your backend Injury Report endpoint
      const response = await fetch('http://localhost:3001/injury-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EmployeeName: formData.employeeName,
          ReportedBy: activeUser,
          InjuryType: formData.injuryType,
          Description: formData.description,
          ReportDate: formData.reportDate,
          Location: formData.location,
          Witnesses: formData.witnesses || null, // Optional
          AdditionalNotes: formData.additionalNotes || null, // Optional
        }),
      });

      if (response.ok) {
        setShowModal(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to submit injury report'}`);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the server. Please check your backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeName: '',
      injuryType: '' as InjuryType,
      description: '',
      reportDate: new Date().toISOString().split('T')[0],
      location: '',
      witnesses: '',
      additionalNotes: ''
    });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-40">
      {/* Breadcrumbs */}
      <header className="bg-white border-b border-slate-200 px-12 py-7 mb-20 shadow-sm">
        <nav className="text-[11px] font-black text-slate-400 flex items-center gap-4 uppercase tracking-[0.25em]">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-slate-300 font-light">{'>'}</span>
          <Link href="/reports" className="hover:text-blue-600 transition-colors">Reports</Link>
          <span className="text-slate-300 font-light">{'>'}</span>
          <span className="text-blue-600">Injury Report</span>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-8">
        <div className="mb-24 text-center">
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-8 uppercase">Injury Report</h1>
          <div className="h-2 w-32 bg-blue-600 mx-auto rounded-full mb-8"></div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-20">
          <form onSubmit={handleSubmit} className="space-y-20">
            <br />
            
            {/* Row 1: Employee Name & Reported By */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="flex flex-col gap-8">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Injured Employee *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-8">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Reported By</label>
                <div className="w-full bg-slate-100 border-2 border-slate-100 rounded-3xl p-7 text-slate-400 font-mono text-xl flex items-center cursor-not-allowed shadow-inner">
                  <span className="mr-5 text-blue-500 text-sm">👤</span> {activeUser}
                </div>
              </div>
            </div>

            {/* Row 2: Date & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="flex flex-col gap-8">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Date of Incident *</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium"
                  value={formData.reportDate}
                  onChange={(e) => setFormData({...formData, reportDate: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-8">
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loading Dock B"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* Injury Type */}
            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Injury Type *</label>
              <div className="relative">
                <select
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none appearance-none cursor-pointer transition-all text-2xl font-medium invalid:text-slate-400"
                  value={formData.injuryType}
                  onChange={(e) => setFormData({...formData, injuryType: e.target.value as InjuryType})}
                >
                  <option value="" disabled hidden>Select Injury Type...</option>
                  {Object.values(InjuryType).map((type) => (
                    <option key={type} value={type} className="text-slate-900">{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Witnesses - Optional */}
            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic underline underline-offset-8 decoration-slate-200">Witnesses (Optional)</label>
              <input
                type="text"
                placeholder="Names of anyone present"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium"
                value={formData.witnesses}
                onChange={(e) => setFormData({...formData, witnesses: e.target.value})}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Detailed Description *</label>
              <textarea
                required
                rows={6}
                placeholder="Describe how the injury occurred..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-2xl font-medium leading-relaxed"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Additional Notes - Optional */}
            <div className="flex flex-col gap-8">
              <label className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic underline underline-offset-8 decoration-slate-200">Additional Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Medical attention provided, etc."
                className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-3xl p-7 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-400 focus:bg-white outline-none transition-all text-2xl font-medium"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
              />
            </div>

            <div className="pt-16">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-[#0047AB] to-[#1E3A8A] text-white font-black py-10 rounded-[3rem] shadow-[0_20px_50px_rgba(30,58,138,0.4)] transition-all text-3xl uppercase tracking-[0.4em] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_25px_60px_rgba(30,58,138,0.5)] active:scale-[0.96]'}`}
              >
                {isSubmitting ? "Logging..." : "Submit Injury Report"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl flex items-center justify-center z-50 p-6">
          <div className="bg-white p-20 rounded-[5rem] shadow-2xl max-w-2xl w-full text-center border border-white/20">
            <div className="w-40 h-40 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-12 text-7xl shadow-inner border border-green-100">✓</div>
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase">Injury Logged</h2>
            <p className="text-slate-500 mb-16 text-2xl leading-relaxed font-medium">Logged for: <span className="text-blue-600 font-bold">{formData.employeeName}</span></p>
            <div className="flex flex-col gap-8">
              <button onClick={handleReset} className="w-full py-8 bg-[#0047AB] text-white rounded-[2rem] hover:bg-blue-800 font-black transition-all shadow-2xl text-xl uppercase tracking-widest">
                File Another Report
              </button>
              <Link href="/" className="w-full py-8 bg-slate-100 text-slate-600 rounded-[2rem] hover:bg-slate-200 font-black transition-all text-xl uppercase tracking-widest block text-center">
                Go Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InjuryReportPage;