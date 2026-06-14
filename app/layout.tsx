import type { Metadata, Viewport } from 'next';
import { Inter, Space_Mono, Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});
const notoJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jp',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HiroshimAI — AIで広島から、未来を実装する。',
  description:
    'HiroshimAI は「AI会社」ではなく、AIを現場へ実装し、人を創造的な仕事へ戻す会社です。広島発・中小企業向け。AI顧問 / AI研修 / AIシステム開発 / IoT。',
};

export const viewport: Viewport = {
  themeColor: '#030304',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${mono.variable} ${notoJP.variable}`}>
      <body>{children}</body>
    </html>
  );
}
