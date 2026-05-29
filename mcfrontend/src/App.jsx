import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

import { Toaster } from 'react-hot-toast';

export default function App() {
    useAutoLogout(); // Default is 30 minutes
    
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
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/appointments" element={<PatientAppointments />} />
                <Route path="/patient/medical-reports" element={<Navigate to="/patient/reports" replace />} />
                <Route path="/patient/reports" element={<PatientMedicalReports />} />
                <Route path="/patient/profile" element={<PatientProfile />} />
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/patients" element={<DoctorPatients />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/profile" element={<DoctorProfile />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<ManageDoctors />} />
                <Route path="/admin/patients" element={<ManagePatients />} />
                <Route path="/admin/services" element={<ManageServices />} />
                <Route path="/admin/appointments" element={<AllAppointments />} />
            </Routes>
        </>
    );
}
