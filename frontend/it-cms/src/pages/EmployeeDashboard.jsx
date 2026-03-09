import React from 'react';
import PieChartDepartmentalComplaints from '../components/PieChartDepartmentalComplaints';
import ComplaintStatus from '../components/ComplaintStatus';
import BarGraphComplaints from '../components/BarGraphComplaints';
import ComplaintTable from '../components/ComplaintTable';

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-[#f1f1f1] p-6">
      <h1 className="text-2xl font-bold text-[#00164f] mb-6">Your Department Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <PieChartDepartmentalComplaints departmentOnly />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ComplaintStatus departmentOnly />
        </div>
      </div>
      <div className="mt-6">
        <BarGraphComplaints departmentOnly />
      </div>
      <div className="mt-6">
        <ComplaintTable departmentOnly />
      </div>
    </div>
  );
}