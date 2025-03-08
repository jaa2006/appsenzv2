export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'student';
  name: string;
  class?: string;
  profile_url?: string;
  created_at: string;
  last_location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export interface Attendance {
  id: string;
  user_id: string;
  type: 'check_in' | 'check_out';
  timestamp: string;
  latitude: number;
  longitude: number;
  is_valid: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  users: User[];
  attendanceRecords: Attendance[];
}

export interface Location {
  latitude: number;
  longitude: number;
}