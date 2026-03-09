import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate
} from 'react-router-dom';

import Navbar from './components/Navbar';
import SignInPopup from './components/SignInPopUp';
import SignOutPopup from './components/SignOutPopup';
import Footer from './components/Footer';

import { AuthProvider, useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeComplaintHistory from './pages/EmployeeComplaintHistory';
import EmployeeComplaintDetails from './pages/EmployeeComplaintDetails';
import ComplaintDetails from './pages/ComplaintDetails';
import RaiseComplaint from './pages/RaiseComplaint';
import AdminViewComplaints from './pages/AdminViewComplaints';
import AssignComplaint from './pages/AssignComplaint';
import AdminResolvedRemarks from './pages/AdminResolvedRemarks';
import ManageTables from './pages/ManageTables';
import EngineerViewComplaints from './pages/EngineerViewComplaints';
import TendComplaint from './pages/TendComplaint';
import ManagementReports from './pages/ManagementReports';
import ResetPassword from './pages/resetPassword';
import AdminRemarkList from './pages/AdminRemarkList'; 

import axios from './components/api';

function AppContent() {
  const { user, login, logout } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async ({ employeeId, role, password }) => {
    try {
      const response = await axios.post('/auth/login', {
        employee_id: employeeId,
        password: password,
        role: role,
      }, { withCredentials: true });

      const data = response.data;
      login({ employeeId: data.employee_id, role: data.role });
      setShowSignIn(false);

      if (pendingRoute) {
        navigate(pendingRoute);
        setPendingRoute(null);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const handleProtectedClick = (path) => {
    if (!user) {
      setPendingRoute(path);
      setShowSignIn(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={!!user}
        userRole={user?.role}
        onSignInClick={() => setShowSignIn(true)}
        onSignOutClick={() => setShowSignOut(true)}
        onProtectedClick={handleProtectedClick}
      />

      <SignInPopup
        show={showSignIn}
        onClose={() => setShowSignIn(false)}
        onLogin={handleLogin}
      />

      <SignOutPopup
        show={showSignOut}
        onClose={() => setShowSignOut(false)}
        onConfirm={() => {
          logout();
          setShowSignOut(false);
          navigate('/');
        }}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={!!user} userRole={user?.role} onProtectedClick={handleProtectedClick} />} />
          <Route path="/dashboard" element={user?.role === 'employee' ? <EmployeeDashboard /> : <Dashboard />} />
          <Route path="/raise" element={<RaiseComplaint />} />
          <Route path="/track-status" element={<EmployeeDashboard />} />
          <Route path="/employee-complaint-history" element={<EmployeeComplaintHistory />} />
          <Route path="/complaint-details/:id" element={<ComplaintDetails />} />
          <Route path="/employee-complaint-details/:id" element={<EmployeeComplaintDetails />} />
          <Route path="/admin-view-complaints" element={<AdminViewComplaints />} />
          <Route path="/assign-complaint/:id" element={<AssignComplaint />} />
          <Route path="/admin-remarks" element={<AdminRemarkList />} /> {/* ✅ FIXED */}
          <Route path="/manage-table" element={<ManageTables />} />
          <Route path="/assigned-complaints" element={<EngineerViewComplaints />} />
          <Route path="/tend-complaint/:id" element={<TendComplaint />} />
          <Route path="/reports" element={<ManagementReports />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-resolved-remarks/:id" element={<AdminResolvedRemarks />} />
        </Routes>
      </main>

      <Footer isLoggedIn={!!user} userRole={user?.role} onProtectedClick={handleProtectedClick} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
