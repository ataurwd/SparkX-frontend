import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from '../components/providers';
import { ServerWakeUpBanner } from '../components/ui/ServerWakeUpBanner';

export const metadata: Metadata = {
  title: 'SparkX — HR & Company Management SaaS',
  description: 'Next-generation all-in-one multi-tenant enterprise operating system for HR, Attendance, Payroll, Work Progress, and Executive Intelligence.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ServerWakeUpBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
