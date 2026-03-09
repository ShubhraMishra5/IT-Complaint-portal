import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { useAuth } from '../context/AuthContext';

export default function BarGraphComplaints({ departmentOnly = false }) {
  const [monthlyComplaints, setMonthlyComplaints] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = 'http://localhost:5000/dashboard/monthly';

        if (departmentOnly && user?.department?.id) {
          url += `?department_id=${user.department.id}`;
        }

        const res = await axios.get(url, { withCredentials: true });
        setMonthlyComplaints(res.data); // Expected format: [{ month: 'Jan', count: 5 }, ...]
      } catch (err) {
        console.error('Error fetching monthly complaints:', err);
      }
    };

    fetchData();
  }, [departmentOnly, user]);

  return (
    <div className="bg-white p-4 rounded shadow w-full">
      <h2 className="text-lg font-semibold text-[#00164f] mb-4">Monthly Complaint Volume</h2>
      <Plot
        data={[{
          x: monthlyComplaints.map(item => item.month),
          y: monthlyComplaints.map(item => item.count),
          type: 'bar',
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