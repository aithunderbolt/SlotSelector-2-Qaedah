import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [adminUser, setAdminUser] = useState(() => {
    const savedUser = localStorage.getItem('adminUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('adminUser');
    }
  }, [adminUser]);

  const handleLogin = (userData) => {
    setAdminUser(userData);
  };

  const handleLogout = () => {
    setAdminUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route
          path="/admin"
          element={
            adminUser ? (
              <AdminDashboard onLogout={handleLogout} user={adminUser} />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
