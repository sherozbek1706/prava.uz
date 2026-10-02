import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './layouts/AdminLayout';

// Student / Public Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Exam from './pages/Exam';
import ExamResult from './pages/ExamResult';
import History from './pages/History';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTests from './pages/admin/AdminTests';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminStudents from './pages/admin/AdminStudents';

// Protected Route wrapper for Admin
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// Protected Route wrapper for Students
function StudentRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Layout wrapper for Public & Student pages (with student Navbar & Footer)
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100 relative selection:bg-emerald-500 selection:text-slate-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public & Student Routes (using PublicLayout with Navbar & Footer) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/exam"
              element={
                <StudentRoute>
                  <Exam />
                </StudentRoute>
              }
            />
            <Route
              path="/exam/result"
              element={
                <StudentRoute>
                  <ExamResult />
                </StudentRoute>
              }
            />
            <Route
              path="/history"
              element={
                <StudentRoute>
                  <History />
                </StudentRoute>
              }
            />
          </Route>

          {/* Standalone Admin Login (Completely separate, without public Navbar) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Dedicated Isolated Admin Dashboard (Standalone AdminLayout with Collapsible Sidebar) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tests" element={<AdminTests />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="students" element={<AdminStudents />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
