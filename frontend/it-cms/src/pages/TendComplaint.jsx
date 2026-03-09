import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../components/api';

export default function TendComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [remark, setRemark] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    axios.get(`/dashboard/complaint/${id.replace(/^C/, '')}`, { withCredentials: true })
      .then((res) => {
        const c = res.data;
        setComplaint({
          ...c,
          assignedEngineer: c.assignedEngineer || '',
          specialization: c.specialization || '',
          contact: c.contact || '',
        });
        setStatus(c.status || '');
        setStartDate(c.startDate || '');
        setEndDate(c.endDate || '');
        setRemark(c.engineerRemark || '');
      })
      .catch((err) => {
        console.error("Failed to fetch complaint", err);
        alert("Could not load complaint details.");
      });
  }, [id]);

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];

    let updatedStartDate = startDate;
    let updatedEndDate = endDate;

    if (complaint.status === 'Open' && status === 'In Progress' && !startDate) {
      updatedStartDate = today;
      setStartDate(today);
    }

    if (status === 'Completed' && !endDate) {
      updatedEndDate = today;
      setEndDate(today);
    }

    console.log('Sending PATCH with:', {
    status,
    engineerRemark: remark,
    startDate: updatedStartDate,
    endDate: updatedEndDate
  });

    axios.patch(`/dashboard/complaints/${id.replace(/^C/, '')}`, {
      status,
      engineerRemark: remark,
      startDate: updatedStartDate || null,
      endDate: updatedEndDate || null
    }, { withCredentials: true })
      .then(() => {
        alert('Complaint updated successfully');
        navigate('/assigned-complaints');
      })
      .catch((err) => {
        console.error("Update failed", err);
        alert('Update failed: ' + (err.response?.data?.error || 'Unknown error'));
      });
  };

  if (!complaint) {
    return <div className="p-6">Loading complaint...</div>;
  }

  const convertNumericPriority = (value) => {
    if (value >= 5) return 'High';
    if (value > 2 && value <= 4) return 'Medium';
    if (value <= 2) return 'Low';
    return 'Low';
  };

  return (
    <div className="p-6 bg-[#f1f1f1] min-h-screen">
      <h2 className="text-2xl font-bold text-[#00164f] mb-6">Tend Complaint - C{id}</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-[#00164f] mb-3">Employee Details</h3>
        <p><span className="font-semibold">Employee ID:</span> {complaint.employeeId}</p>
        <p><span className="font-semibold">Name:</span> {complaint.submittedBy}</p>
        <p><span className="font-semibold">Email:</span> {complaint.email}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-[#00164f] mb-3">Complaint Info</h3>
        <p><span className="font-semibold">Category:</span> {complaint.category}</p>
        <p><span className="font-semibold">Type:</span> {complaint.complaintType}</p>
        <p><span className="font-semibold">Created At:</span> {complaint.createdAt}</p>
        <p><span className="font-semibold">Title:</span> {complaint.title}</p>
        <p><span className="font-semibold">Description:</span> {complaint.description}</p>
        <p><span className="font-semibold">Priority:</span> {convertNumericPriority(complaint.priority)}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-[#00164f] mb-3">Engineer Assignment</h3>
        <p><span className="font-semibold">Specialization:</span> {complaint.specialization}</p>
        <p><span className="font-semibold">Assigned Engineer:</span> {complaint.assignedEngineer}</p>
        <p><span className="font-semibold">Contact:</span> {complaint.contact}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-[#00164f] mb-3">Complaint Status</h3>

        {status !== 'Open' && (
          <p><span className="font-semibold">Start Date:</span> {startDate || '-'}</p>
        )}
        {status === 'Completed' && (
          <p><span className="font-semibold">End Date:</span> {endDate || '-'}</p>
        )}

        <div className="mt-4">
          <label className="block font-semibold mb-1">Update Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select Status --</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block font-semibold mb-1">Engineer Remark:</label>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows="4"
            placeholder="Enter any comments or observations..."
          />
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-[#00164f] text-white rounded hover:bg-[#002c88] transition"
        >
          Update Complaint
        </button>
      </div>
    </div>
  );
}
