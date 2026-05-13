// /app/layout.tsx
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/providers/query-provider";
import { UserPreferencesProvider } from "@/components/providers/user-preferences-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans dark", geist.variable)}>
      <body>
        <QueryProvider>
          <UserPreferencesProvider>{children}</UserPreferencesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}