import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../components/api';

export default function AdminViewComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/dashboard/Admin-view-complaint')
      .then(response => {
        setComplaints(response.data);
        setFilteredComplaints(response.data);
      })
      .catch(error => {
        console.error("Error fetching complaints:", error);
      });
  }, []);

  useEffect(() => {
    let filtered = [...complaints];

    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter((c) => {
        const p = c.priority;
        if (priorityFilter === 'Low') return p <= 2;
        if (priorityFilter === 'Medium') return p > 2 && p <= 4;
        if (priorityFilter === 'High') return p >= 5;
        return true;
      });
    }

    setFilteredComplaints(filtered);
  }, [statusFilter, priorityFilter, complaints]);

  const getStatusBadge = (status) => {
    const base = 'px-2 py-1 rounded text-white text-xs font-medium';
    if(status === 'Closed') return <span className={`${base} bg-[#AF52DE]`}>Closed</span>
    if (status === 'Completed') return <span className={`${base} bg-[#5856D6]`}>Completed</span>;
    if (status === 'In Progress') return <span className={`${base} bg-[#007AFF]`}>In Progress</span>;
    if (status === 'Open') return <span className={`${base} bg-[#32ADE6]`}>Open</span>;
    return <span className={`${base} bg-gray-400`}>{status || '---'}</span>;
  };

  const getRowClassByPriority = (priority) => {
    if (priority <= 2) return 'bg-green-100';
    if (priority > 2 && priority <= 4) return 'bg-yellow-100';
    if (priority >= 5) return 'bg-red-100';
    return '';
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full min-h-screen overflow-auto">
      <h2 className="text-lg font-semibold text-[#00164f] mb-4">All Complaints</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Filter by Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-[#00164f] text-white text-sm uppercase">
          <tr>
            <th className="px-4 py-3">Complaint ID</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3">Submitted By</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3">Engineer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Assign Task</th>
            <th className="px-4 py-3">Remark</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredComplaints.map((c) => (
            <tr key={c.id} className={getRowClassByPriority(c.priority)}>
              <td className="px-4 py-3">{c?.id || '---'}</td>
              <td className="px-4 py-3">{c?.date || '---'}</td>
              <td className="px-4 py-3">{c?.submittedBy || '---'}</td>
              <td className="px-4 py-3">{c?.department || '---'}</td>
              <td className="px-4 py-3">{c?.category || '---'}</td>
              <td className="px-4 py-3">{c?.complaintType || '---'}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() =>
                    navigate(`/complaint-details/${c.id}`, { state: { complaint: c } })
                  }
                  className="border border-[#00164f] rounded-md text-[#00164f] px-3 py-1 text-xs hover:bg-[#004077] hover:text-white transition"
                >
                  View
                </button>
              </td>
              <td className="px-4 py-3">{c.engineer || '---'}</td>
              <td className="px-4 py-3">{getStatusBadge(c.status)}</td>
              <td className="px-4 py-3">
                {c.isAssigned ? (
                  <span className="text-gray-500">Assigned</span>
                ) : (
                  <button
                    onClick={() =>
                      navigate(`/assign-complaint/${c.id}`, { state: { complaint: c } })
                    }
                    className="text-blue-700 underline hover:text-blue-900"
                  >
                    Assign
                  </button>
                )}
              </td>
              <td className="px-4 py-3">
                {c.status === 'Completed' ? (
  c.adminRemark ? (
    <span className="text-green-700 font-medium">{c.adminRemark}</span>
  ) : (
    <button
      onClick={() =>
        navigate(`/admin-resolved-remarks/${c.id}`, { state: { complaint: c } })
      }
      className="text-blue-700 underline hover:text-blue-900"
    >
      Add Remark
    </button>
  )
) : (
  <span className="text-gray-500">---</span>
)}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
