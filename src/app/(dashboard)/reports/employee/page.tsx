"use client";

import React, { useState } from 'react';
import Link from 'next/link';

enum EmployeeReportTypeEnum {
  Performance = "Performance",
  Conduct = "Conduct",
  Attendance = "Attendance",
  Safety = "Safety Violation",
  Grievance = "Grievance",
  Other = "Other",
}

const EmployeeReportPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeUser] = useState("John"); 

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    reportType: '' as EmployeeReportTypeEnum,
    reportDate: new Date().toISOString().split('T')[0],
    description: '',
    previousWarnings: '',
    additionalNotes: '',
    actionTaken: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reportType) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/employee-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reportedBy: activeUser,
          department: formData.department || null,
          previousWarnings: formData.previousWarnings || null,
          additionalNotes: formData.additionalNotes || null,
          actionTaken: formData.actionTaken || null,
        }),
      });

      if (response.ok) setShowModal(true);
      else alert("Submission failed. Check backend logs.");
    } catch (error) {
      alert("Connection Error: Is the backend running on port 3001?");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeId: '', employeeName: '', department: '',
      reportType: '' as EmployeeReportTypeEnum,
      reportDate: new Date().toISOString().split('T')[0],
      description: '', previousWarnings: '', additionalNotes: '', actionTaken: ''
    });
    setShowModal(false);
  };

  // Common class for all inputs and textareas to make them bigger & uniform
  const inputClass = "w-full bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-16 focus:ring-[12px] focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-3xl font-bold shadow-sm";

  const textareaClass = "w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-16 focus:ring-[12px] focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-3xl font-medium leading-relaxed shadow-sm";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-60">
      {/* Breadcrumbs */}
      <header className="bg-white border-b border-slate-200 px-12 py-8 mb-24 shadow-sm">
        <nav className="text-xs font-black text-slate-400 flex items-center gap-6 uppercase tracking-[0.3em]">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-slate-300 font-light text-xl">/</span>
          <Link href="/reports" className="hover:text-blue-600 transition-colors">Reports</Link>
          <span className="text-slate-300 font-light text-xl">/</span>
          <span className="text-blue-600">Employee Report</span>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-10">
        <div className="mb-32 text-center">
          <h1 className="text-8xl font-black text-slate-900 tracking-tighter mb-10 uppercase italic">Employee Report</h1>
          <div className="h-3 w-48 bg-blue-600 mx-auto rounded-full mb-10 shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
        </div>

        <div className="bg-white rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100 p-24">
          <form onSubmit={handleSubmit} className="space-y-24">

            {/* Employee ID */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Employee ID *</label>
              <input
                type="text" required placeholder="EMP-001"
                className={inputClass}
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              />
            </div>
            

            {/* Full Name */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Full Name *</label>
              <input
                type="text" required placeholder="Enter full name"
                className={inputClass}
                value={formData.employeeName}
                onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
              />
            </div>
            

            {/* Department */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Department</label>
              <input
                type="text" placeholder="Enter department"
                className={inputClass}
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>

            {/* Report Type */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Report Type *</label>
              <select
                required
                className={`${inputClass} appearance-none cursor-pointer`}
                value={formData.reportType}
                onChange={(e) => setFormData({...formData, reportType: e.target.value as EmployeeReportTypeEnum})}
              >
                <option value="" disabled hidden>Select Category</option>
                {Object.values(EmployeeReportTypeEnum).map(t => <option key={t} value={t} className="text-slate-900">{t}</option>)}
              </select>
            </div>

            {/* Report Date */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Date *</label>
              <input
                type="date" required
                className={inputClass}
                value={formData.reportDate}
                onChange={(e) => setFormData({...formData, reportDate: e.target.value})}
              />
            </div>

            {/* Incident Description */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-500 uppercase tracking-[0.25em]">Incident Description *</label>
              <textarea
                required rows={10}
                placeholder="Describe the incident in detail..."
                className={textareaClass}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Warnings */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-400 uppercase tracking-[0.25em] italic underline underline-offset-8 decoration-slate-200">Warnings (Optional)</label>
              <textarea
                rows={6} placeholder="List previous warnings..."
                className={textareaClass}
                value={formData.previousWarnings}
                onChange={(e) => setFormData({...formData, previousWarnings: e.target.value})}
              />
            </div>

            {/* Action Taken */}
            <div className="flex flex-col gap-10">
              <label className="text-sm font-black text-slate-400 uppercase tracking-[0.25em] italic underline underline-offset-8 decoration-slate-200">Action Taken (Optional)</label>
              <textarea
                rows={6} placeholder="List disciplinary actions..."
                className={textareaClass}
                value={formData.actionTaken}
                onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-20">
              <button
                type="submit" disabled={isSubmitting}
                className="w-full bg-gradient-to-br from-[#0047AB] via-[#1E3A8A] to-[#111827] text-white font-black py-12 rounded-[4rem] shadow-[0_30px_70px_-15px_rgba(30,58,138,0.5)] hover:shadow-[0_40px_80px_-10px_rgba(30,58,138,0.6)] active:scale-[0.97] transition-all text-4xl uppercase tracking-[0.5em]"
              >
                {isSubmitting ? "Processing..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl flex items-center justify-center z-50 p-10">
          <div className="bg-white p-24 rounded-[6rem] shadow-2xl max-w-3xl w-full text-center border border-white/20">
            <div className="w-48 h-48 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-14 text-8xl shadow-inner border border-green-100 italic font-black">!</div>
            <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Entry Recorded</h2>
            <p className="text-slate-500 mb-20 text-3xl leading-relaxed font-medium">Employee Record for <span className="text-blue-600 font-bold">{formData.employeeName}</span> has been securely logged.</p>
            <div className="flex flex-col gap-10">
              <button onClick={handleReset} className="w-full py-10 bg-[#0047AB] text-white rounded-[2.5rem] hover:bg-blue-800 font-black transition-all shadow-2xl text-2xl uppercase tracking-widest">Create New Entry</button>
              <Link href="/" className="w-full py-10 bg-slate-100 text-slate-600 rounded-[2.5rem] hover:bg-slate-200 font-black transition-all text-2xl uppercase tracking-widest block text-center">Exit to Dashboard</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeReportPage;