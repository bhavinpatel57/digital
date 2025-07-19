import './globals.css';
import ElementXLoader from './components/element-x.js';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: 'Inventory & Billing',
  description: 'Track your products and invoices',
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
        <header>
          <ElementXLoader />
          <h1>Inventory & Billing </h1>
        </header>
        <main className='main-content'>{children}</main></GoogleOAuthProvider>
      </body>
    </html>
  );
}
