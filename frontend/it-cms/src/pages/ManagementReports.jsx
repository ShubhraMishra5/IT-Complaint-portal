import React from 'react';
import ComplaintTable from '../components/ComplaintTable';

export default function ManagementReports() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold text-[#00164f] mb-6">Management Reports</h1>
      <ComplaintTable />
    </div>
  );
}