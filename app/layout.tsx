import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'S3 Upload Service',
  description: 'Simple image upload service for AWS S3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
