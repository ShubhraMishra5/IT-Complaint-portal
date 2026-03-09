import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const convertNumericPriority = (value) => {
  if (value >= 5) return 'High';
  if (value > 2 && value <= 4) return 'Medium';
  if (value <= 2) return 'Low';
  return 'Low';
};

export default function ComplaintTable() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    priority: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/dashboard/complaint-records', {
          withCredentials: true
        });
        setComplaints(response.data);
        setFilteredComplaints(response.data);
      } catch (err) {
        console.error("Failed to fetch complaint records", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = complaints.filter((c) => {
      const matchDept = filters.department ? c.department === filters.department : true;
      const matchStatus = filters.status ? c.status === filters.status : true;
      const matchPriority = filters.priority
        ? convertNumericPriority(c.priority) === filters.priority
        : true;
      return matchDept && matchStatus && matchPriority;
    });

    setFilteredComplaints(filtered);
  }, [filters, complaints]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full overflow-auto">
      <h2 className="text-lg font-semibold text-[#00164f] mb-4">Complaint Records</h2>

      {/* Priority Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded-sm" /> High Priority
        </span>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-sm" /> Medium Priority
        </span>
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded-sm" /> Low Priority
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <select
          name="department"
          value={filters.department}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Departments</option>
          <option value="Finance">Finance</option>
          <option value="HR">HR</option>
          <option value="IS">IS</option>
          <option value="M&C">M&C</option>
          <option value="Operations & Maintenance">Operations & Maintenance</option>
          <option value="Security">Security</option>
          <option value="CSR">CSR</option>
          <option value="construction">construction</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-[#00164f] text-white">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Submitted By</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Created On</th>
            <th className="px-4 py-3">Start Date</th>
            <th className="px-4 py-3">End Date</th>
            <th className="px-4 py-3">Engineer</th>
            <th className="px-4 py-3">Complaint Details</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredComplaints.map((complaint) => {
            const priorityLabel = convertNumericPriority(complaint.priority);
            return (
              <tr key={complaint.id} className={`${getPriorityColor(priorityLabel)} transition`}>
                <td className="px-4 py-3">{complaint.id}</td>
                <td className="px-4 py-3">{complaint.title}</td>
                <td className="px-4 py-3">{complaint.complaintType}</td>
                <td className="px-4 py-3">{complaint.category}</td>
                <td className="px-4 py-3">{complaint.submittedBy}</td>
                <td className="px-4 py-3">{complaint.department}</td>
                <td className="px-4 py-3">{complaint.date}</td>
                <td className="px-4 py-3">{complaint.startDate || '-'}</td>
                <td className="px-4 py-3">{complaint.endDate || '-'}</td>
                <td className="px-4 py-3">{complaint.engineer}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      navigate(`/complaint-details/${complaint.id}`, { state: { complaint } })
                    }
                    className="border border-[#00164f] rounded-md text-[#00164f] px-3 py-1 text-xs hover:bg-[#004077] hover:text-white transition"
                  >
                    View
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className={getStatusBadge(complaint.status)}>{complaint.status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
