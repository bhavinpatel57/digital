import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './components/NotificationProvider.js';
import { AuthProvider } from '@/context/AuthContext';
import { ShopProvider } from '@/context/ShopContext'; // ✅ NEW: import ShopProvider
import Header from './header/page.js';
import ElementXLoader from './components/element-x.js';

export const metadata = {
  title: 'Inventory & Billing',
  description: 'Track your products and invoices',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ShopProvider> 
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
              <NotificationProvider>
                <main className="main-content">
                  <ElementXLoader />
                  <Header />
                  {children}
                </main>
              </NotificationProvider>
            </GoogleOAuthProvider>
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
