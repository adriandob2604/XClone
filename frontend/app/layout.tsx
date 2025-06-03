"use client";
import "./globals.css";
import LayoutShell from "./components/layoutShell";
import { KeycloakProvider } from "./keycloakprovider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <KeycloakProvider>
          <LayoutShell>{children}</LayoutShell>
        </KeycloakProvider>
      </body>
    </html>
  );
}
