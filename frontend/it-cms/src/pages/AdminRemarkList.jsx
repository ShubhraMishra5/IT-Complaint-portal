import React, { useEffect, useState } from "react";
import axios from "../components/api";

export default function AdminRemarkList() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    axios.get("/dashboard/Admin-view-complaint")
      .then((res) => {
        const filtered = res.data.filter(c => c.remark && c.remark !== "Add");
        setComplaints(filtered);
      })
      .catch((err) => {
        console.error("Error fetching remarks:", err);
      });
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold text-[#00164f] mb-4">Admin Remarks</h2>
      {complaints.length === 0 ? (
        <p className="text-gray-600">No remarks added yet.</p>
      ) : (
        <table className="min-w-full text-sm text-left text-gray-600 border">
          <thead className="bg-[#00164f] text-white text-sm uppercase">
            <tr>
              <th className="px-4 py-3">Complaint ID</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Admin Remark</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.complaint_id} className="border-b">
                <td className="px-4 py-3">{c.complaint_id}</td>
                <td className="px-4 py-3">{c.title}</td>
                <td className="px-4 py-3 text-green-700 font-medium">{c.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
