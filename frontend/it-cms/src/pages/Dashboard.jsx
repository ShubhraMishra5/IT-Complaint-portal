import React from 'react';
import PieChartDepartmentalComplaints from '../components/PieChartDepartmentalComplaints';
import ComplaintStatus from '../components/ComplaintStatus';
import BarGraphComplaints from '../components/BarGraphComplaints';
import ComplaintTable from '../components/ComplaintTable';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f1f1f1] p-6">
      <h1 className="text-2xl font-bold text-[#00164f] mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div>
  <h2>Pie Chart Debug Start</h2>
  <PieChartDepartmentalComplaints />
  <h2>Pie Chart Debug End</h2>
</div>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ComplaintStatus />
        </div>
      </div>
      <div className="mt-6">
        <BarGraphComplaints />
      </div>
      <div className="mt-6">
        <ComplaintTable />
      </div>
    </div>
  );
}