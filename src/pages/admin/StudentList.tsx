import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Users } from 'lucide-react';

interface AddStudentFormProps {
  onClose: () => void;
  defaultClass: string;
}

function AddStudentForm({ onClose, defaultClass }: AddStudentFormProps) {
  const { addUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    class: defaultClass
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      ...formData,
      role: 'student'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Tambah Siswa Baru - {defaultClass}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-base"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClassContainer({ className, students, onDelete }: { 
  className: string;
  students: Array<any>;
  onDelete: (id: string) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">{className}</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {students.length} siswa
          </span>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            <Plus size={14} className="mr-1" />
            Tambah
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-2 text-sm">
            Belum ada siswa
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="flex justify-between items-center p-2 bg-gray-50 rounded"
            >
              <div>
                <p className="font-medium text-sm">{student.name}</p>
                <p className="text-xs text-gray-500">@{student.username}</p>
              </div>
              <button
                onClick={() => onDelete(student.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <AddStudentForm 
          onClose={() => setShowAddForm(false)} 
          defaultClass={className}
        />
      )}
    </div>
  );
}

function GradeContainer({ grade, classes }: { 
  grade: string;
  classes: string[];
}) {
  const { getUsers, removeUser } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="mr-2" size={20} />
        Kelas {grade}
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {classes.map((className) => (
          <ClassContainer
            key={className}
            className={className}
            students={getUsers(className)}
            onDelete={removeUser}
          />
        ))}
      </div>
    </div>
  );
}

export default function StudentList() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Daftar Siswa</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GradeContainer
          grade="10"
          classes={['10 TKJ 1', '10 TKJ 2']}
        />
        <GradeContainer
          grade="11"
          classes={['11 TKJ 1', '11 TKJ 2']}
        />
        <GradeContainer
          grade="12"
          classes={['12 TKJ 1', '12 TKJ 2']}
        />
      </div>
    </div>
  );
}