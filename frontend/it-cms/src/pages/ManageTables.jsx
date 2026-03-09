import React, { useState, useEffect } from 'react';

const ManageTables = () => {
  const [employees, setEmployees] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showEngineerForm, setShowEngineerForm] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    email: '',
    department_id: '',
    role: '',
    password: ''
  });

  const [newEngineer, setNewEngineer] = useState({
    engineer_id: '',
    name: '',
    contact: '',
    specialization: '',
    password: ''
  });

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const API = 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API}/dashboard/employees`)
      .then(res => res.json())
      .then(setEmployees)
      .catch(() => setEmployees([]));

    fetch(`${API}/dashboard/manage-engineers`)
      .then(res => res.json())
      .then(setEngineers)
      .catch(() => setEngineers([]));
  }, []);

  const handleAddEmployee = () => {
    fetch(`${API}/dashboard/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setEmployees(prev => [...prev, data]);
        setNewEmployee({
          employee_id: '',
          name: '',
          email: '',
          department_id: '',
          role: '',
          password: ''
        });
        setShowEmployeeForm(false);
      });
  };

  const handleAddEngineer = () => {
    fetch(`${API}/dashboard/manage-engineers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEngineer)
    })
      .then(res => res.json())
      .then(() => {
        // ✅ Fetch full updated list after adding
        fetch(`${API}/dashboard/manage-engineers`)
          .then(res => res.json())
          .then(setEngineers);

        setNewEngineer({
          engineer_id: '',
          name: '',
          contact: '',
          specialization: '',
          password: ''
        });
        setShowEngineerForm(false);
      });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;

    fetch(`${API}/dashboard/${type}s/${id}`, { method: 'DELETE' })
      .then(() => {
        if (type === 'employee') {
          fetch(`${API}/dashboard/employees`)
            .then(res => res.json())
            .then(setEmployees);
        } else {
          fetch(`${API}/dashboard/manage-engineers`)
            .then(res => res.json())
            .then(setEngineers);
        }
        setShowDeletePopup(false);
      });
  };

  const triggerDelete = (type, id) => {
    setDeleteTarget({ type, id });
    setShowDeletePopup(true);
  };

  return (
    <div className="min-h-screen bg-[#f1f1f1] p-6 space-y-10">
      {/* EMPLOYEE TABLE */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#f37021]">EMPLOYEE TABLE</h2>
          <button onClick={() => setShowEmployeeForm(!showEmployeeForm)} className="bg-[#00164f] text-white px-4 py-1 rounded">
            {showEmployeeForm ? 'Cancel' : '+ Add Employee'}
          </button>
        </div>
        {showEmployeeForm && (
          <div className="space-y-2 mb-4">
            {Object.entries(newEmployee).map(([key, val]) => (
              <input
                key={key}
                className="w-full p-2 border rounded"
                placeholder={key.replace(/_/g, ' ')}
                value={val}
                onChange={e => setNewEmployee({ ...newEmployee, [key]: e.target.value })}
                type={key === 'password' ? 'password' : 'text'}
              />
            ))}
            <button onClick={handleAddEmployee} className="bg-[#00164f] text-white px-4 py-2 rounded">Add Employee</button>
          </div>
        )}
        <table className="w-full border-collapse">
          <thead className="bg-[#00164f] text-white">
            <tr>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.employee_id} className="text-center border-b">
                <td>{emp.employee_id}</td>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department_id}</td>
                <td>{emp.role}</td>
                <td>
                  <button onClick={() => triggerDelete('employee', emp.employee_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ENGINEER TABLE */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#f37021]">ENGINEER TABLE</h2>
          <button onClick={() => setShowEngineerForm(!showEngineerForm)} className="bg-[#00164f] text-white px-4 py-1 rounded">
            {showEngineerForm ? 'Cancel' : '+ Add Engineer'}
          </button>
        </div>
        {showEngineerForm && (
          <div className="space-y-2 mb-4">
            {Object.entries(newEngineer).map(([key, val]) => (
              <input
                key={key}
                className="w-full p-2 border rounded"
                placeholder={key.replace(/_/g, ' ')}
                value={val}
                onChange={e => setNewEngineer({ ...newEngineer, [key]: e.target.value })}
                type={key === 'password' ? 'password' : 'text'}
              />
            ))}
            <button onClick={handleAddEngineer} className="bg-[#00164f] text-white px-4 py-2 rounded">Add Engineer</button>
          </div>
        )}
        <table className="w-full border-collapse">
          <thead className="bg-[#00164f] text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Specialization</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {engineers.map(eng => (
              <tr key={eng.engineer_id} className="text-center border-b">
                <td>{eng.engineer_id}</td>
                <td>{eng.name}</td>
                <td>{eng.contact}</td>
                <td>{eng.specialization}</td>
                <td>
                  <button onClick={() => triggerDelete('engineer', eng.engineer_id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DELETE POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#d9d9d9] p-6 rounded-xl shadow-xl w-[400px] text-center">
            <h2 className="text-xl font-semibold text-[#00164f] mb-4">Confirm Deletion</h2>
            <p className="text-[#333333] mb-6">Are you sure you want to delete this record?</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="bg-[#00164f] hover:bg-[#004077] text-white px-4 py-2 rounded">Yes, Delete</button>
              <button onClick={() => setShowDeletePopup(false)} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTables;
