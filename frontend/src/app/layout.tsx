import './globals.css';
import Link from 'next/link';
import Script from 'next/script'; // <-- à ajouter

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Script AdSense global */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <Script id="adsense-init" strategy="afterInteractive">
          {`
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-6110877543393981", // <-- Remplace par TON ID AdSense
              enable_page_level_ads: true
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-[#18192a] via-[#23244a] to-[#0f172a]">
        {/* Header / Navbar */}
        <header className="w-full flex justify-between items-center px-8 py-5 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-2xl text-white tracking-tight drop-shadow-lg">PcAnalys</span>
          </div>
          <nav className="flex gap-8 items-center">
            <Link href="/" className="text-white/90 hover:text-white text-base font-medium transition">Accueil</Link>
            <Link href="/diagnostic" className="text-white/90 hover:text-white text-base font-medium transition">Diagnostic</Link>
            <Link href="/historique" className="text-white/90 hover:text-white text-base font-medium transition">Historique</Link>
            <Link href="/a-propos" className="text-white/90 hover:text-white text-base font-medium transition">À propos</Link>
          </nav>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        {/* Footer */}
        <footer className="w-full py-4 px-8 text-center text-white/70 text-sm">
          © {new Date().getFullYear()}<b> PcAnalys</b> <br /> Fait avec ❤️ par un passionné d'hardware <br /> <br />
        </footer>
      </body>
    </html>
  );
}
