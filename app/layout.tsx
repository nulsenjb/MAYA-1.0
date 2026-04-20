import './globals.css';
import type { ReactNode } from 'react';
import { NavBar } from '@/components/nav-bar';

export const metadata = {
  title: 'Maya',
  description: 'Personalized beauty, makeup, wardrobe, and style harmony app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}