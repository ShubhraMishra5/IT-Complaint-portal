import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../components/api';

export default function AssignComplaint() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const complaintState = state?.complaint;

  const [complaint, setComplaint] = useState(null);
  const [priority, setPriority] = useState('');
  const [expertise, setExpertise] = useState('');
  const [engineers, setEngineers] = useState([]);
  const [assignedEngineer, setAssignedEngineer] = useState('');
  const [engineerContact, setEngineerContact] = useState('');

  useEffect(() => {
    if (!complaintState?.id) return;

    axios.get(`/dashboard/complaint/${complaintState.id}`)
      .then(res => {
        setComplaint(res.data);
        setPriority(res.data.priority);
      })
      .catch(err => console.error('Failed to fetch complaint:', err));

    axios.get('/dashboard/engineers')
      .then(res => setEngineers(res.data))
      .catch(err => console.error('Failed to fetch engineers:', err));
  }, [complaintState]);

  useEffect(() => {
    const eng = engineers.find(e => e.name === assignedEngineer);
    setEngineerContact(eng?.contact || '---');
  }, [assignedEngineer, engineers]);

  const handleAssign = async () => {
    const engineer = engineers.find(e => e.name === assignedEngineer);
    if (!engineer) {
      alert('Please select a valid engineer.');
      return;
    }

    try {
      await axios.post(`/dashboard/assign-complaint/${complaint.id}`, {
        priority,
        engineer_id: engineer.id,
      });
      alert('Complaint assigned successfully!');
      navigate('/admin-view-complaints');
    } catch (error) {
      console.error('Assignment failed:', error);
      alert('Assignment failed.');
    }
  };

  if (!complaint) return <div className="text-gray-600 p-4">Loading complaint data...</div>;

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-5xl mx-auto">
      <h2 className="text-lg font-semibold text-[#00164f] mb-4">Assign Complaint</h2>

      {/* Complaint Details */}
      <div className="border rounded p-4 mb-6 bg-gray-50">
        <h3 className="text-md font-semibold mb-2">Complaint Details</h3>
        <p><strong>Description:</strong> {complaint.description}</p>
        <p><strong>Employee:</strong> {complaint.submittedBy}</p>
        <p><strong>Email:</strong> {complaint.email}</p>
        <p><strong>Department:</strong> {complaint.department}</p>
        <p><strong>Category:</strong> {complaint.category}</p>
        <p><strong>Subcategory:</strong> {complaint.complaintType}</p>
        <p><strong>Created At:</strong> {complaint.createdAt}</p>
        {complaint.adminRemark && (
          <p className="text-green-700 mt-2"><strong>Existing Remark:</strong> {complaint.adminRemark}</p>
        )}
      </div>

      <div className="border rounded p-4 mb-6">
        <h3 className="text-md font-semibold mb-3">Assignment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium mb-1">Priority:</label>
            <input
              type="number"
              value={priority}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Expertise:</label>
            <select
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">All</option>
              {[...new Set(engineers.map(e => e.expertise))].map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Assign Engineer:</label>
            <select
              value={assignedEngineer}
              onChange={(e) => setAssignedEngineer(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select engineer</option>
              {engineers
                .filter(e => expertise === '' || e.expertise === expertise)
                .map(e => (
                  <option key={e.id} value={e.name}>{e.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Engineer Contact:</label>
            <input
              type="text"
              value={engineerContact}
              readOnly
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={handleAssign}
            className="bg-[#00164f] hover:bg-[#00164fcc] text-white px-5 py-2 rounded"
          >
            Assign Complaint
          </button>
          <button
            onClick={() => navigate(`/admin-resolved-remarks/${complaint.id}`, { state: { complaint } })}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
          >
            Add Remark
          </button>
        </div>
      </div>
    </div>
  );
}
