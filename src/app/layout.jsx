import './globals.css';

export const metadata = {
  title: 'DTU Arcade · 3D Games & Showdown',
  description: 'Community-driven open source 3D WebGL games for DTU students: Prof Showdown 2.5D and 3D DTU Campus Explorer.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white min-h-screen antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
