import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { RentalApplicationProvider } from "@/contexts/rental-application-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rental Application Process",
  description: "Complete your rental application in 7 simple steps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-hidden h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RentalApplicationProvider>
            {children}
            <Toaster />
          </RentalApplicationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
