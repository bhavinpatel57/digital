'use client';

import { useAuth } from '@/context/AuthContext';
import { notifyGlobal } from '../components/NotificationProvider';

export default function Header() {
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout(); // clears localStorage and context
      notifyGlobal({
        title: 'Logged out',
        message: 'You have been logged out successfully.',
        type: 'success',
      });
    } catch (err) {
      console.error('Logout failed', err);
      notifyGlobal({
        title: 'Logout failed',
        message: 'Something went wrong while logging out.',
        type: 'alert',
      });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.name || user.email}</p>
          <div onClick={handleLogout} style={{ cursor: 'pointer', color: 'blue' }}>
            Logout
          </div>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
