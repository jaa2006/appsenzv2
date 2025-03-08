export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          role: 'admin' | 'student';
          name: string;
          class?: string;
          profile_url?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          role: 'admin' | 'student';
          name: string;
          class?: string;
          profile_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: 'admin' | 'student';
          name?: string;
          class?: string;
          profile_url?: string;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          type: 'check_in' | 'check_out';
          timestamp: string;
          latitude: number;
          longitude: number;
          is_valid: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'check_in' | 'check_out';
          timestamp?: string;
          latitude: number;
          longitude: number;
          is_valid?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'check_in' | 'check_out';
          timestamp?: string;
          latitude?: number;
          longitude?: number;
          is_valid?: boolean;
        };
      };
    };
  };
}