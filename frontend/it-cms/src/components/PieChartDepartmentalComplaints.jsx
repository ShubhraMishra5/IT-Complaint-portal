import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';

export default function PieChartDepartmentalComplaints({ departmentOnly = false }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Department color mapping (can be customized)
  const departmentColors = {
    //'IT': '#1f77b4',
    //'Operations': '#ff7f0e',
    'Finance': '#2ca02c',
    'HR': '#d62728',
    'Security': '#9467bd',
    'CSR': '#8c564b',
    'Construction': '#e377c2',
    'IS': '#7f7f7f',
    'M&C': '#bcbd22',
    'Operations & Maintenance': '#17becf',
    'Others': '#cccccc',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = departmentOnly
          ? 'http://localhost:5000/dashboard/department-wise?departmentOnly=true'
          : 'http://localhost:5000/dashboard/department-wise';

        const response = await axios.get(endpoint, { withCredentials: true });
        console.log("Received Pie Chart data:", response.data);

        if (Array.isArray(response.data)) {
          setData(response.data);
          setError(null);
        } else {
          throw new Error("Invalid data format from server");
        }
      } catch (err) {
        console.error("PieChartDepartmentalComplaints error:", err);
        setError('Failed to load chart data.');
      }
    };

    fetchData();
  }, [departmentOnly]);

  // Handle error
  if (error) {
    return (
      <div className="bg-white p-4 rounded shadow w-full text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Handle no data
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow w-full text-gray-500">
        <p>No department data available</p>
      </div>
    );
  }

  // Group small values into "Others"
  const threshold = 1;
  const grouped = data.reduce((acc, curr) => {
    if (curr.count <= threshold) {
      acc.others += curr.count;
    } else {
      acc.data.push(curr);
    }
    return acc;
  }, { data: [], others: 0 });

  const chartData = [...grouped.data];
  if (grouped.others > 0) {
    chartData.push({ department: 'Others', count: grouped.others });
  }

  const labels = chartData.map(d => d.department || 'Unknown');
  const values = chartData.map(d => d.count);
  const colors = labels.map(label => departmentColors[label] || '#999999');

  return (
    <div className="bg-white p-4 rounded shadow w-full">
      <h2 className="text-lg font-semibold text-[#00164f] mb-4">Departmental Complaints</h2>
      <Plot
        data={[{
          type: 'pie',
          labels: labels,
          values: values,
          marker: { colors: colors },
          textinfo: 'label+percent',
          insidetextorientation: 'radial',
        }]}
        layout={{
          height: 300,
          margin: { t: 30, b: 30, l: 30, r: 30 },
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
