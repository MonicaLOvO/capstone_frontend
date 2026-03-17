"use client";

import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center py-20 px-6">
      
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            Reports Center
          </h1>
          <p className="text-blue-500 text-lg leading-relaxed">
            Access and manage all system reports from one place.
          </p>
        </div>
        <br></br>


        {/* Reports List */}
        <div className="space-y-6">

          <Link href="/reports/inventory">
            <div className="group border-l-4 border-blue-600 pl-6 py-4 hover:bg-blue-50 rounded-lg transition cursor-pointer">
              <h2 className="text-2xl font-semibold text-blue-700 group-hover:underline">
                Inventory Report
              </h2>
              <p className="text-blue-500 mt-2 leading-relaxed">
                Report warehouse stock that has been lost, damaged, expired, or stolen.
              </p>
            </div>
          </Link>
          <br>
          </br>



          <Link href="/reports/injury">
            <div className="group border-l-4 border-blue-600 pl-6 py-4 hover:bg-blue-50 rounded-lg transition cursor-pointer">
              <h2 className="text-2xl font-semibold text-blue-700 group-hover:underline">
                Injury Report
              </h2>
              <p className="text-blue-500 mt-2 leading-relaxed">
                Document a workplace injury or incident involving an employee.
              </p>
            </div>
          </Link>

          <br>
          </br>

          <Link href="/reports/employee">
            <div className="group border-l-4 border-blue-600 pl-6 py-4 hover:bg-blue-50 rounded-lg transition cursor-pointer">
              <h2 className="text-2xl font-semibold text-blue-700 group-hover:underline">
                Employee Reports
              </h2>
              <p className="text-blue-500 mt-2 leading-relaxed">
                Report an employee for conduct, performance, attendance, or safety violations.
              </p>
            </div>
          </Link>

          <br></br>


        </div>

      </div>
    </div>
  );
}