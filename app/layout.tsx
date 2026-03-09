import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Particles from '@/components/Particles';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus-AI - Enterprise AI Orchestration',
  description: 'Secure, governed access to multiple LLM providers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ThemeProvider>
          <Particles />
          <div className="relative z-10">
            <UserProvider>{children}</UserProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
