import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './components/NotificationProvider.js';
import { AuthProvider } from '@/context/AuthContext'; // ✅ import it
import Header from './header/page.js'; // ✅ Import Header component
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
              <ElementXLoader />  
<GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <NotificationProvider>
              <main className='main-content'>
                <Header />
                {children}
              </main>
          </NotificationProvider>
        </GoogleOAuthProvider>
            </AuthProvider>
      </body>
    </html>
  );
}
