import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../components/api'; // uses axios with baseURL + withCredentials
import { useAuth } from '../context/AuthContext';
import VerifyComplaintPopup from '../components/VerifyComplaintPopup';

const convertPriorityToNumber = (priority) => {
  switch (priority) {
    case 'High': return 3;
    case 'Medium': return 2;
    case 'Low': return 1;
    default: return 0;
  }
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
  const base = 'text-xs px-3 py-1 rounded-full font-semibold ';
  switch (status) {
    case 'Open': return base + 'bg-[#32ADE6] text-white';
    case 'In Progress': return base + 'bg-[#007AFF] text-white';
    case 'Completed': return base + 'bg-[#5856D6] text-white';
    case 'Closed': return base + 'bg-[#AF52DE] text-white';
    default: return base + 'bg-gray-200 text-black';
  }
};

export default function EmployeeComplaintHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    if (!user?.employeeId) return;

    axios
      .get(`/complaints/employee-complaints/${user.employeeId}`)
      .then((res) => {
        setComplaints(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch complaints:', err);
        setLoading(false);
      });
  }, [user]);

  const handleVerify = (complaint) => {
    console.log("Opening popup for complaint:", complaint);
    setSelectedComplaint({
      ...complaint,
      complaint_id: parseInt(complaint.id.replace(/^C/, '') || '0')
    });
    setShowVerifyPopup(true);
  };

  const handleClosePopup = () => {
    setShowVerifyPopup(false);
    setSelectedComplaint(null);
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#00164f] mb-4">My Complaint History</h1>

      <div className="bg-white p-6 rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-[#00164f] text-white text-sm uppercase">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Details</th>
              <th className="px-4 py-2">Engineer</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-4">Loading complaints...</td>
              </tr>
            ) : (
              complaints.map((complaint) => (
                <tr key={complaint.id} className={`border-b ${getPriorityColor(complaint.priority)}`}>
                  <td className="px-4 py-2">{complaint.id}</td>
                  <td className="px-4 py-2">{complaint.date}</td>
                  <td className="px-4 py-2">{complaint.started_at || '-'}</td>
                  <td className="px-4 py-2">{complaint.completed_at || '-'}</td>
                  <td className="px-4 py-2">{complaint.category}</td>
                  <td className="px-4 py-2">{complaint.title || complaint.subcategory}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/employee-complaint-details/${complaint.id}`, { state: { complaint } })}
                      className="border border-[#00164f] rounded-md text-[#00164f] px-3 py-1 text-xs hover:bg-[#004077] hover:text-white transition"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-4 py-2">{complaint.engineer || '---'}</td>
                  <td className="px-4 py-2">
                    <span className={getStatusBadge(complaint.status)}>{complaint.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    {complaint.status === 'Completed' && (
                      <button
                        onClick={() => handleVerify(complaint)}
                        className="text-sm bg-[#00164f] text-white px-3 py-1 rounded hover:bg-[#004077]"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showVerifyPopup && selectedComplaint && (
        <VerifyComplaintPopup
          complaint={selectedComplaint}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
