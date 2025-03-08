import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FileSpreadsheet, File as FilePdf, MapPin } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../lib/export';
import { SCHOOL_LOCATION } from '../../config/constants';
import { isWithinRadius } from '../../lib/geolocation';

export default function AttendanceReport() {
  const { users, attendanceRecords } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showLocations, setShowLocations] = useState(false);
  const [studentLocations, setStudentLocations] = useState<any[]>([]);

  useEffect(() => {
    if (showLocations) {
      const interval = setInterval(() => {
        const activeStudents = users.filter(user => 
          user.role === 'student' && user.last_location
        ).map(user => ({
          id: user.id,
          name: user.name,
          class: user.class,
          location: user.last_location
        }));
        setStudentLocations(activeStudents);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showLocations, users]);

  const dailyAttendance = attendanceRecords.filter(record => 
    record.timestamp.startsWith(selectedDate)
  );

  const chartData = users
    .filter(user => user.role === 'student')
    .map(user => {
      const checkIns = attendanceRecords.filter(
        record => record.user_id === user.id && record.type === 'check_in'
      ).length;
      return {
        name: user.name,
        checkIns,
        class: user.class
      };
    });

  const handleExportPDF = () => {
    const headers = ['Nama', 'Kelas', 'Waktu', 'Tipe', 'Status'];
    const rows = dailyAttendance.map(record => {
      const user = users.find(u => u.id === record.user_id);
      return [
        user?.name || '',
        user?.class || '',
        format(new Date(record.timestamp), 'HH:mm', { locale: id }),
        record.type === 'check_in' ? 'Masuk' : 'Keluar',
        record.is_valid ? 'Valid' : 'Tidak Valid'
      ];
    });

    exportToPDF({ headers, rows }, `absensi-${selectedDate}`);
  };

  const handleExportExcel = () => {
    const headers = ['Nama', 'Kelas', 'Waktu', 'Tipe', 'Status'];
    const rows = dailyAttendance.map(record => {
      const user = users.find(u => u.id === record.user_id);
      return [
        user?.name || '',
        user?.class || '',
        format(new Date(record.timestamp), 'HH:mm', { locale: id }),
        record.type === 'check_in' ? 'Masuk' : 'Keluar',
        record.is_valid ? 'Valid' : 'Tidak Valid'
      ];
    });

    exportToExcel({ headers, rows }, `absensi-${selectedDate}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <h2 className="text-2xl font-bold">Laporan Absensi</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            <FileSpreadsheet className="mr-1.5" size={16} />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FilePdf className="mr-1.5" size={16} />
            PDF
          </button>
          <button
            onClick={() => setShowLocations(!showLocations)}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <MapPin className="mr-1.5" size={16} />
            {showLocations ? 'Sembunyikan Lokasi' : 'Lihat Lokasi'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyAttendance.map((record, index) => {
                const user = users.find(u => u.id === record.user_id);
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{user?.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {format(new Date(record.timestamp), 'HH:mm', { locale: id })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.type === 'check_in' ? 'Masuk' : 'Keluar'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          record.is_valid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.is_valid ? 'Valid' : 'Tidak Valid'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Grafik Kehadiran</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="checkIns" name="Jumlah Kehadiran" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showLocations && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Lokasi Siswa Aktif</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studentLocations.map(student => (
              <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">
                  <h4 className="font-semibold">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.class}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Latitude: </span>
                    <span className="font-mono">{student.location.latitude.toFixed(6)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Longitude: </span>
                    <span className="font-mono">{student.location.longitude.toFixed(6)}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status: </span>
                    <span className={`font-semibold ${
                      isWithinRadius(student.location) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isWithinRadius(student.location) ? 'Di dalam zona' : 'Di luar zona'}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Update terakhir: {format(new Date(student.location.timestamp), 'HH:mm:ss', { locale: id })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}