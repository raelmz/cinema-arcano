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
          <a
            href="#conteudo-principal"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-arcano-main focus:bg-arcano-main focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:uppercase focus:text-arcano-bg"
          >
            Pular para o conteúdo
          </a>
          <Cabecalho />
          <main id="conteudo-principal" className="flex flex-1 flex-col">
            {children}
          </main>
          <Rodape />
        </AuthProvider>
      </body>
    </html>
  );
}
