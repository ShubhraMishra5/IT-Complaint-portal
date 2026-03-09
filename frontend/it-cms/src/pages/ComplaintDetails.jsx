import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from '../components/api';

export default function ComplaintDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [complaint, setComplaint] = useState(null);

  const displayValue = (value) => {
    return value && value.toString().trim() !== '' ? value : '---';
  };

  useEffect(() => {
  const numericId = id.startsWith('C') ? parseInt(id.substring(1)) : id;

  fetch(`http://localhost:5000/dashboard/complaints/${numericId}`, {
    credentials: 'include',
  })
    .then((res) => {
      if (!res.ok) throw new Error("Complaint not found");
      return res.json();
    })
    .then((data) => setComplaint(data))
    .catch((err) => {
      console.error("Failed to fetch complaint:", err);
    });
}, [id]);


  if (!complaint) {
    return <div className="p-6 text-center text-gray-600">Loading complaint details...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-sm text-gray-700">
      <h2 className="text-2xl font-semibold text-[#00164f] mb-4">Complaint Details - {displayValue(complaint.id)}</h2>

      {/* Section 1: Overview */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold text-[#00164f] mb-2">Complaint Overview</h3>
        <p><strong>Employee ID:</strong> {displayValue(complaint.employeeId)}</p>
        <p><strong>Name:</strong> {displayValue(complaint.name)}</p>
        <p><strong>Email:</strong> {displayValue(complaint.email)}</p>
        <p><strong>Category:</strong> {displayValue(complaint.category)}</p>
        <p><strong>Complaint Type:</strong> {displayValue(complaint.complaintType)}</p>
        <p><strong>Created At:</strong> {displayValue(complaint.date)}</p>
        <p><strong>Title:</strong> {displayValue(complaint.title)}</p>
        <p><strong>Description:</strong> {displayValue(complaint.description)}</p>
        <p><strong>Priority:</strong> {displayValue(complaint.priority)}</p>
        <p><strong>Engineer Expertise:</strong> {displayValue(complaint.expertise)}</p>
        <p><strong>Assigned Engineer:</strong> {displayValue(complaint.engineer)}</p>
        <p><strong>Engineer Contact:</strong> {displayValue(complaint.engineerContact)}</p>
      </div>

      {/* Section 2: Status & Remarks */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold text-[#00164f] mb-2">Complaint Status</h3>
        <p><strong>Start Date:</strong> {displayValue(complaint.startDate)}</p>
        <p><strong>End Date:</strong> {displayValue(complaint.endDate)}</p>
        <p><strong>Status:</strong> {displayValue(complaint.status)}</p>
        <p><strong>Engineer Remark:</strong> {displayValue(complaint.engineerRemark)}</p>
        <p><strong>Admin Remark:</strong> {displayValue(complaint.adminRemark)}</p>
      </div>

      {/* Section 3: Verification */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold text-[#00164f] mb-2">Verification</h3>
        <p><strong>Employee Verification Remark:</strong> {displayValue(complaint.employeeVerificationRemark)}</p>
      </div>
    </div>
  );
}
