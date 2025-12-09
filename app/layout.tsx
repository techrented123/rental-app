import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { RentalApplicationProvider } from "@/contexts/rental-application-context";
import { GoogleMapsProvider } from "@/components/providers/google-maps-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rental Application Process",
  description: "Complete your rental application in 7 simple steps",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={`${inter.className} md:overflow-hidden md:h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                Loading...
              </div>
            }
          >
            <RentalApplicationProvider>
              <GoogleMapsProvider>
                {children}
                <Toaster />
              </GoogleMapsProvider>
            </RentalApplicationProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
