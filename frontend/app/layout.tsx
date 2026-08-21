import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Cabecalho } from "./components/ui/Cabecalho";
import { Rodape } from "./components/ui/Rodape";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cinema Arcano",
  description: "Plataforma de sessões e ingressos do Cinema Arcano",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Cabecalho />
          <main className="flex flex-1 flex-col">{children}</main>
          <Rodape />
        </AuthProvider>
      </body>
    </html>
  );
}
