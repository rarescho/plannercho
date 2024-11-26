import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import db from "@/lib/supabase/db";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
});
import { Toaster } from '@/components/ui/toaster';
import { SupabaseUserProvider } from '@/lib/providers/supabase-user-provider';
import AppStateProvider from '@/lib/providers/state-provider';
import { SocketProvider } from "@/lib/providers/socket-provider";

export const metadata: Metadata = {
  title: "Computer House Planner",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // console.log(db);
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          <AppStateProvider>
            <SupabaseUserProvider>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>

            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
