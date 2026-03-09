import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

export default function EmployeeComplaintDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const complaint = location.state?.complaint;

  // Helper to map numeric priority to label
  const getPriorityLabel = (value) => {
    if (value <= 2) return 'Low';
    if (value > 2 && value <= 4) return 'Medium';
    if (value >= 5) return 'High';
    return 'N/A';
  };

  // Helper to generate status badge classes
  const getStatusBadge = (status) => {
    const base = 'inline-block px-3 py-1 text-xs font-semibold rounded ';
    switch (status) {
      case 'Open':
        return base + 'bg-[#32ADE6] text-white';
      case 'In Progress':
        return base + 'bg-[#007AFF] text-white';
      case 'Completed':
        return base + 'bg-[#5856D6] text-white';
      case 'Closed':
        return base + 'bg-[#AF52DE] text-white';
      default:
        return base + 'bg-gray-300 text-black';
    }
  };

  if (!complaint) {
    return (
      <div className="min-h-screen p-6 bg-[#f1f1f1]">
        <h1 className="text-xl font-bold text-red-600">Complaint not found</h1>
        <p>Please go back to your complaint history and try again.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#00164f] text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#f1f1f1]">
      <h1 className="text-2xl font-bold text-[#00164f] mb-4">
        Complaint Details - {complaint.id}
      </h1>

      <div className="bg-white rounded shadow p-6 space-y-4">
        <p><strong>Title:</strong> {complaint.title}</p>
        <p><strong>Department:</strong> {complaint.department}</p>

        <p>
          <strong>Status:</strong>{' '}
          <span className={getStatusBadge(complaint.status)}>
            {complaint.status}
          </span>
        </p>

        <p>
          <strong>Priority:</strong>{' '}
          {getPriorityLabel(complaint.priority)} ({complaint.priority})
        </p>

        <p><strong>Date Raised:</strong> {complaint.date}</p>
        <p><strong>Start Date:</strong> {complaint.startDate || '-'}</p>
        <p><strong>End Date:</strong> {complaint.endDate || '-'}</p>
        <p><strong>Engineer Assigned:</strong> {complaint.engineer || '-'}</p>
        {complaint.category && <p><strong>Category:</strong> {complaint.category}</p>}
        {complaint.type && <p><strong>Type:</strong> {complaint.type}</p>}
        {complaint.details && <p><strong>Description:</strong> {complaint.details}</p>}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-[#00164f] text-white rounded hover:bg-[#004077]"
      >
        ← Back to History
      </button>
    </div>
  );
}