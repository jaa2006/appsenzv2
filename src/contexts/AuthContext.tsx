import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Attendance, Location } from '../types';
import { isWithinRadius } from '../lib/geolocation';
import toast from 'react-hot-toast';
import { 
  saveToStorage, 
  loadFromStorage, 
  appendToStorage, 
  updateInStorage, 
  removeFromStorage 
} from '../lib/storage';

interface AuthState {
  user: User | null;
  loading: boolean;
  users: User[];
  attendanceRecords: Attendance[];
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  removeUser: (userId: string) => void;
  getUsers: (classFilter?: string) => User[];
  updateUserLocation: (userId: string, location: Location) => void;
  recordAttendance: (userId: string, type: 'check_in' | 'check_out', location: Location) => void;
  updateProfilePicture: (userId: string, imageUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser: User = {
  id: 'admin',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  name: 'Administrator',
  created_at: new Date().toISOString()
};

const initialState: AuthState = {
  user: null,
  loading: false,
  users: [adminUser],
  attendanceRecords: []
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const storedData = loadFromStorage();
    return storedData || initialState;
  });

  // Save state to storage whenever it changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  async function login(username: string, password: string) {
    try {
      const user = state.users.find(u => 
        u.username === username && u.password === password
      );

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const { password: _, ...userWithoutPassword } = user;
      setState(prev => ({ ...prev, user: userWithoutPassword, loading: false }));
      toast.success(`Selamat datang, ${user.name}!`);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login gagal. Username atau password salah.');
      throw error;
    }
  }

  async function logout() {
    try {
      setState(prev => ({ ...prev, user: null, loading: false }));
      toast.success('Berhasil keluar dari sistem');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal keluar dari sistem');
      throw error;
    }
  }

  function addUser(newUser: Omit<User, 'id' | 'created_at'>) {
    const user: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    setState(prev => {
      const updatedState = {
        ...prev,
        users: [...prev.users, user]
      };
      return updatedState;
    });

    appendToStorage('users', user);
    toast.success('Pengguna berhasil ditambahkan');
  }

  function removeUser(userId: string) {
    setState(prev => {
      const updatedState = {
        ...prev,
        users: prev.users.filter(user => user.id !== userId),
        attendanceRecords: prev.attendanceRecords.filter(record => record.user_id !== userId)
      };
      return updatedState;
    });

    removeFromStorage('users', userId);
    toast.success('Pengguna berhasil dihapus');
  }

  function getUsers(classFilter?: string) {
    if (!classFilter) return state.users;
    return state.users.filter(user => user.class === classFilter);
  }

  function updateUserLocation(userId: string, location: Location) {
    setState(prev => {
      const updatedUsers = prev.users.map(user =>
        user.id === userId
          ? {
              ...user,
              last_location: {
                ...location,
                timestamp: new Date().toISOString()
              }
            }
          : user
      );

      const updatedState = {
        ...prev,
        users: updatedUsers
      };
      return updatedState;
    });

    updateInStorage('users', userId, {
      last_location: {
        ...location,
        timestamp: new Date().toISOString()
      }
    });
  }

  function recordAttendance(userId: string, type: 'check_in' | 'check_out', location: Location) {
    const isValid = isWithinRadius(location);
    const attendance: Attendance = {
      id: `attendance-${Date.now()}`,
      user_id: userId,
      type,
      timestamp: new Date().toISOString(),
      latitude: location.latitude,
      longitude: location.longitude,
      is_valid: isValid
    };

    setState(prev => {
      const updatedState = {
        ...prev,
        attendanceRecords: [...prev.attendanceRecords, attendance]
      };
      return updatedState;
    });

    appendToStorage('attendanceRecords', attendance);

    if (isValid) {
      toast.success(`Berhasil melakukan ${type === 'check_in' ? 'check-in' : 'check-out'}`);
    } else {
      toast.error('Lokasi Anda di luar area yang diizinkan');
    }
  }

  function updateProfilePicture(userId: string, imageUrl: string) {
    setState(prev => {
      const updatedUsers = prev.users.map(user =>
        user.id === userId
          ? { ...user, profile_url: imageUrl }
          : user
      );

      const updatedState = {
        ...prev,
        users: updatedUsers
      };
      return updatedState;
    });

    updateInStorage('users', userId, { profile_url: imageUrl });
    toast.success('Foto profil berhasil diperbarui');
  }

  const value = {
    ...state,
    login,
    logout,
    addUser,
    removeUser,
    getUsers,
    updateUserLocation,
    recordAttendance,
    updateProfilePicture
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}