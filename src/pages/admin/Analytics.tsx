import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function Analytics() {
  const { users, attendanceRecords } = useAuth();

  const studentsByClass = useMemo(() => {
    const classes = ['10 TKJ 1', '10 TKJ 2', '11 TKJ 1', '11 TKJ 2', '12 TKJ 1', '12 TKJ 2'];
    return classes.map(className => ({
      name: className,
      students: users.filter(user => user.class === className).length
    }));
  }, [users]);

  const attendanceStats = useMemo(() => {
    const total = attendanceRecords.length;
    const valid = attendanceRecords.filter(record => record.is_valid).length;
    const invalid = total - valid;

    return [
      { name: 'Valid', value: valid },
      { name: 'Tidak Valid', value: invalid }
    ];
  }, [attendanceRecords]);

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Analitik</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Distribusi Siswa per Kelas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByClass}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" name="Jumlah Siswa" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Status Absensi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attendanceStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {attendanceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Ringkasan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-600">Total Siswa</h4>
              <p className="text-2xl font-bold text-blue-800">
                {users.filter(user => user.role === 'student').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-600">Absensi Valid</h4>
              <p className="text-2xl font-bold text-green-800">
                {attendanceRecords.filter(record => record.is_valid).length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-red-600">Absensi Tidak Valid</h4>
              <p className="text-2xl font-bold text-red-800">
                {attendanceRecords.filter(record => !record.is_valid).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-600">Total Kelas</h4>
              <p className="text-2xl font-bold text-purple-800">6</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}