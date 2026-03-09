import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "../components/api";

export default function AdminResolvedRemarks() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.complaint) {
      setComplaint(location.state.complaint);
      setRemark(location.state.complaint.adminRemark || "");
      setLoading(false);
    } else {
      axios
        .get(`/dashboard/complaint/${id}`)
        .then((res) => {
          setComplaint(res.data);
          setRemark(res.data.adminRemark || "");
        })
        .catch((err) => {
          console.error("Error fetching complaint:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, location.state]);

  const handleSubmit = async () => {
    try {
      await axios.patch(`/dashboard/complaints/${id}/admin-remark`, {
        adminRemark: remark, 
      });
      alert("Remark added successfully!");
      navigate("/admin-view-complaints");
    } catch (err) {
      console.error("Error adding remark:", err);
      alert("Failed to add remark.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading complaint details...</p>;
  }

  if (!complaint) {
    return <p className="text-center text-red-500">Complaint not found.</p>;
  }

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-[#00164f] mb-4">
        Add Remark for Complaint #{complaint.complaint_id || id}
      </h2>

      <p className="mb-4 text-gray-700">
        <strong>Description:</strong> {complaint.description}
      </p>

      <textarea
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Enter admin remark"
        className="w-full border rounded p-2 mb-4"
        rows="4"
      />

      <button
        onClick={handleSubmit}
        className="bg-[#00164f] text-white px-4 py-2 rounded hover:bg-[#003077]"
      >
        Submit Remark
      </button>
    </div>
  );
}
