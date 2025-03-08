import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Users, ClipboardList, BarChart2, LogOut, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StudentList from './StudentList.tsx';
import AttendanceReport from './AttendanceReport.tsx';
import Analytics from './Analytics.tsx';
import About from '../../components/About';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div className="w-full sm:w-64 bg-blue-800 text-white p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold">AppsenzV2</h1>
          <p className="text-blue-300 text-sm sm:text-base">Panel Admin</p>
        </div>

        <nav className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
          <Link
            to="/admin/students"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm sm:text-base"
          >
            <Users size={20} />
            <span>Daftar Siswa</span>
          </Link>
          <Link
            to="/admin/attendance"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm sm:text-base"
          >
            <ClipboardList size={20} />
            <span>Laporan Absensi</span>
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm sm:text-base"
          >
            <BarChart2 size={20} />
            <span>Analitik</span>
          </Link>
          <Link
            to="/admin/about"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm sm:text-base"
          >
            <Info size={20} />
            <span>Tentang</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-700 transition-colors mt-4 sm:mt-auto text-sm sm:text-base w-full sm:absolute sm:bottom-6"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-x-hidden">
        <Routes>
          <Route path="students" element={<StudentList />} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="about" element={<About />} />
          <Route path="/" element={<StudentList />} />
        </Routes>
      </div>
    </div>
  );
}