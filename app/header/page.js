'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { notifyGlobal } from '../components/NotificationProvider';
import Image from 'next/image';
import './header.css'; // Assuming you have a CSS file for styles
import { ExThemeswitcher } from '@bhavinpatel57/element-x';

let ExButton, ExNavbar;
export default function Header() {
  const { user, loading, logout } = useAuth();
  const [isReady, setIsReady] = useState(false);

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
      notifyGlobal({
        title: 'Logout failed',
        message: 'Something went wrong while logging out.',
        type: 'alert',
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@bhavinpatel57/element-x').then(mod => {
        ExButton = mod.ExButton;
        ExNavbar = mod.ExNavbar;
        setIsReady(true);
      });
    }
  }, []);

  const MenuItems = [
    { title: 'Home', route: '/' },
    { title: 'Shop', route: '/shop' },
    { title: 'Product', route: '/product' },
    { title: 'Settings', route: '/settings' },
  ];

  const handleRoute = (e) => {
    const route = e?.detail; // for flexibility

    if (typeof window !== 'undefined' && window.$nuxt?.$router) {
      window.$nuxt.$router.push(route);
    } else {
      window.location.href = route;
    }
  };

  const activePath = typeof window !== 'undefined' ? window.location.pathname : '/';


  if (!isReady) return null;

  return (
    <>
      <ExNavbar MenuItems={MenuItems} onrouteChange={handleRoute} activeRoute={activePath}>
        <div slot="prepend">
<Image src={'/logo.png'} alt="Logo" width={40} height={40} className='icon'/>
        </div>
        <div slot="append">
       <div className='append'>
        <ExThemeswitcher/>
           {user ? (
            <div className='user-info'>
              <p className='info'>Welcome, {user.name || user.email}</p>
              <ExButton onClick={handleLogout}>
                Logout
              </ExButton>
            </div>
          ) : (
            <ExButton onClick={() => window.location.href = '/auth'}>
              Login
            </ExButton>
          )}
       </div>
        </div>
      </ExNavbar>
    </>
  );
}
