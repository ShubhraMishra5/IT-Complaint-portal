import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../components/api';

const convertNumericPriority = (value) => {
  if (value >= 5) return 'High';
  if (value > 2 && value <= 4) return 'Medium';
  return 'Low';
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'bg-red-100';
    case 'Medium': return 'bg-yellow-100';
    case 'Low': return 'bg-green-100';
    default: return '';
  }
};

const getStatusBadge = (status) => {
  const base = 'text-xs font-semibold px-2 py-1 rounded-full ';
  switch (status) {
    case 'Open': return base + 'bg-[#32ADE6] text-white';
    case 'In Progress': return base + 'bg-[#007AFF] text-white';
    case 'Completed': return base + 'bg-[#5856D6] text-white';
    case 'Closed': return base + 'bg-[#AF52DE] text-white';
    default: return base + 'bg-gray-200 text-black';
  }
};

export default function EngineerViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/dashboard/engineer-complaints')
      .then(res => setComplaints(res.data))
      .catch(err => console.error('Failed to fetch complaints:', err));
  }, []);

  const filteredComplaints = statusFilter === 'All'
    ? complaints
    : complaints.filter(comp => comp.status === statusFilter);

  const handleView = (id) => navigate(`/complaint-details/${id}`);
  const handleTend = (id) => navigate(`/tend-complaint/${id}`);

  return (
    <div className="min-h-screen p-6 bg-[#f1f1f1]">
      <h2 className="text-2xl font-bold text-[#00164f] mb-6">Assigned Complaints</h2>

      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="All">All</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 border border-red-300 rounded-sm" /> High Priority</span>
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-sm" /> Medium Priority</span>
        <span className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 border border-green-300 rounded-sm" /> Low Priority</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white rounded shadow text-sm">
          <thead className="bg-[#00164f] text-white">
            <tr>
              <th className="px-4 py-2">Complaint ID</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Submitted By</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Complaint Type</th>
              <th className="px-4 py-2">Details</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((comp) => {
              const priorityLabel = convertNumericPriority(comp.priority);
              return (
                <tr key={comp.id} className={`${getPriorityColor(priorityLabel)} text-center border-t`}>
                  <td className="py-2">{comp.id}</td>
                  <td>{comp.createdAt}</td>
                  <td>{comp.startDate || '-'}</td>
                  <td>{comp.endDate || '-'}</td>
                  <td>{comp.submittedBy}</td>
                  <td>{comp.department}</td>
                  <td>{comp.category}</td>
                  <td>{comp.complaintType}</td>
                  <td>
                    <button
                      onClick={() => handleView(comp.id)}
                      className="border border-[#00164f] rounded-md text-[#00164f] px-3 py-1 text-xs hover:bg-[#004077] hover:text-white transition"
                    >
                      View
                    </button>
                  </td>
                  <td>
                    {comp.status === 'Closed' ? (
                      <span className={getStatusBadge(comp.status)}>{comp.status}</span>
                    ) : (
                      <button
                        onClick={() => handleTend(comp.id)}
                        className={`${getStatusBadge(comp.status)} cursor-pointer`}
                      >
                        {comp.status}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan="10" className="py-4 text-gray-600 text-center">
                  No complaints found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
