import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, LogOut, CheckCircle, XCircle, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentPosition, isWithinRadius } from '../../lib/geolocation';
import { SCHOOL_LOCATION } from '../../config/constants';
import toast from 'react-hot-toast';
import useSound from 'use-sound';
import About from '../../components/About';

const outOfRangeSound = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function StudentDashboard() {
  const { user, logout, updateUserLocation, recordAttendance, updateProfilePicture } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profile_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2940&auto=format&fit=crop');
  const [play] = useSound(outOfRangeSound);

  useEffect(() => {
    if (user?.profile_url) {
      setProfileImage(user.profile_url);
    }
  }, [user?.profile_url]);

  useEffect(() => {
    let watchId: number;

    if ('geolocation' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            watchId = startLocationTracking();
            setPermissionChecked(true);
          } else if (result.state === 'prompt') {
            const toastId = toast.loading('Mohon izinkan akses lokasi untuk melakukan absensi');
            getCurrentPosition()
              .then((position) => {
                toast.dismiss(toastId);
                setLocation(position);
                watchId = startLocationTracking();
                setPermissionChecked(true);
              })
              .catch((error) => {
                toast.dismiss(toastId);
                toast.error('Akses lokasi diperlukan untuk melakukan absensi');
                console.error('Location error:', error);
                setPermissionChecked(true);
              });
          } else {
            toast.error('Akses lokasi diperlukan untuk melakukan absensi');
            setPermissionChecked(true);
          }

          result.addEventListener('change', () => {
            if (result.state === 'granted') {
              watchId = startLocationTracking();
              setPermissionChecked(true);
            }
          });
        })
        .catch((error) => {
          console.error('Permission error:', error);
          toast.error('Gagal mendapatkan izin lokasi');
          setPermissionChecked(true);
        });
    } else {
      toast.error('Browser Anda tidak mendukung geolokasi');
      setPermissionChecked(true);
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const startLocationTracking = () => {
    return navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        if (user) {
          updateUserLocation(user.id, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }
      },
      (error) => {
        console.error('Location tracking error:', error);
        toast.error('Gagal mendapatkan lokasi');
      },
      { 
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleAttendance = async (type: 'check_in' | 'check_out') => {
    if (!user || !location) {
      toast.error('Lokasi tidak tersedia');
      return;
    }

    setLoading(true);
    try {
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      if (!isWithinRadius(userLocation)) {
        play();
        toast.error('Anda berada di luar zona sekolah');
        return;
      }

      recordAttendance(user.id, type, userLocation);
    } catch (error) {
      console.error('Attendance error:', error);
      toast.error('Gagal melakukan absensi');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const imageUrl = reader.result as string;
          await updateProfilePicture(user.id, imageUrl);
          setProfileImage(imageUrl);
          toast.success('Foto profil berhasil diperbarui');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error updating profile picture:', error);
        toast.error('Gagal memperbarui foto profil');
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!permissionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-600 text-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicture}
                />
                <User size={12} className="text-emerald-600" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold">AppsenzV2</h1>
              <p className="text-emerald-200 text-sm sm:text-base">Selamat datang, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg transition-colors"
            >
              <Info size={20} />
              <span>Tentang</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {showAbout ? (
          <About />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Clock className="text-emerald-600" size={24} />
                <h2 className="text-lg sm:text-xl font-semibold">Absensi</h2>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => handleAttendance('check_in')}
                  disabled={loading || !location}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <CheckCircle size={20} />
                  <span>Check In</span>
                </button>
                <button
                  onClick={() => handleAttendance('check_out')}
                  disabled={loading || !location}
                  className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <XCircle size={20} />
                  <span>Check Out</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex items-center space-x-4 mb-6">
                <MapPin className="text-emerald-600" size={24} />
                <h2 className="text-lg sm:text-xl font-semibold">Lokasi Anda</h2>
              </div>
              {location ? (
                <div className="space-y-2">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Latitude:</p>
                    <p className="font-mono">{location.coords.latitude.toFixed(6)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Longitude:</p>
                    <p className="font-mono">{location.coords.longitude.toFixed(6)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Status:</p>
                    <p className={`font-semibold ${isWithinRadius({
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude
                    }) ? 'text-green-600' : 'text-red-600'}`}>
                      {isWithinRadius({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                      }) ? 'Di dalam zona sekolah' : 'Di luar zona sekolah'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center bg-gray-50 rounded-lg text-gray-500">
                  Menunggu lokasi...
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}