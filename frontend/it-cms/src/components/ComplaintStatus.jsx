import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

export default function ComplaintStatus({ departmentOnly = false }) {
  const [statusCounts, setStatusCounts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const endpoint = departmentOnly
          ? 'http://localhost:5000/dashboard/status?departmentOnly=true'
          : 'http://localhost:5000/dashboard/status';

        const response = await axios.get(endpoint, { withCredentials: true });
        setStatusCounts(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch complaint status data:", err);
        setError("Failed to load status data.");
      }
    };

    fetchStatusCounts();
  }, [departmentOnly]);

  if (error) {
    return <div className="text-red-500 bg-white p-4 rounded shadow">{error}</div>;
  }

  if (!Array.isArray(statusCounts) || statusCounts.length === 0) {
    return <div className="text-gray-500 bg-white p-4 rounded shadow">No data available</div>;
  }

  const labels = statusCounts.map(item => item.status);
  const values = statusCounts.map(item => item.count);

  return (
    <div className="bg-white p-4 rounded shadow w-full">
      <h2 className="text-lg font-semibold text-[#00164f] mb-4">Complaint Status</h2>
      <Plot
        data={[{
          x: labels,
          y: values,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: '#00164f' },
        }]}
        layout={{
          responsive: true,
          height: 300,
          margin: { t: 40, b: 40, l: 30, r: 30 },
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
