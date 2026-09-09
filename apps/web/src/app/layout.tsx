import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Navbar } from '../components/Navbar';
import { AIAssistantWidget } from '../components/AIAssistantWidget';

export const metadata: Metadata = {
  title: 'RideFlow — Effortless, Reliable Urban Mobility',
  description: 'Book rides with transparent upfront pricing, verified drivers, and real-time tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <AIAssistantWidget />
      </body>
    </html>
  );
}
