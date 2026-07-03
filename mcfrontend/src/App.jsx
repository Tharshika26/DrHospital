import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import useAutoLogout from './hooks/useAutoLogout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalReports from './pages/patient/PatientMedicalReports';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorProfile from './pages/doctor/DoctorProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import ManageServices from './pages/admin/ManageServices';
import AllAppointments from './pages/admin/AllAppointments';
import AdminProfile from './pages/admin/AdminProfile';
import ProtectedRoute from './components/ProtectedRoute';

import { Toaster } from 'react-hot-toast';

export default function App() {
    useAutoLogout(); // Default is 30 minutes
    
    // Cross-tab synchronization to ensure only one active session per browser
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'userInfo' && e.newValue) {
                try {
                    const oldData = e.oldValue ? JSON.parse(e.oldValue) : {};
                    const newData = JSON.parse(e.newValue);
                    
                    // Only reload if the actual token changed (a new login or logout)
                    if (oldData.token !== newData.token) {
                        window.location.reload();
                    }
                } catch (err) {
                    window.location.reload();
                }
            } else if (e.key === 'userInfo' && !e.newValue) {
                // Logged out
                window.location.href = '/login';
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Enforce DB truth on refresh
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    useEffect(() => {
        const verifySession = async () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                // Fetch the real profile to override any manipulated localStorage values
                await authService.fetchProfile();
            }
            setIsCheckingSession(false);
        };
        verifySession();
    }, []);

    if (isCheckingSession) {
        return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
    }

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        background: '#1e293b', // slate-800
                        color: '#f8fafc', // slate-50
                        border: '1px solid #334155', // slate-700
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#1c6b64', // emerald-500
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444', // red-500
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Patient Routes */}
                <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
                <Route path="/patient/medical-reports" element={<Navigate to="/patient/reports" replace />} />
                <Route path="/patient/reports" element={<ProtectedRoute allowedRoles={['patient']}><PatientMedicalReports /></ProtectedRoute>} />
                <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

                {/* Doctor Routes */}
                <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
                <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
                <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><ManageDoctors /></ProtectedRoute>} />
                <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><ManagePatients /></ProtectedRoute>} />
                <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><ManageServices /></ProtectedRoute>} />
                <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AllAppointments /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />
            </Routes>
        </>
    );
}
