import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 fade-in">
      <div className="flex flex-col items-center gap-6 mt-20 mb-10 slide-up">
        <div className="icon-bg shadow-lg mb-2 glow"><Sparkles className="w-10 h-10 text-white" /></div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#06b6d4] via-[#a78bfa] to-[#06b6d4] bg-clip-text text-transparent text-center drop-shadow-lg fade-in">Bienvenue sur PcAnalys</h1>
        <p className="text-lg md:text-2xl text-white text-center max-w-2xl fade-in" style={{animationDelay:'0.2s'}}>Analysez votre PC en un clic, obtenez analyse faite par l'IA et découvrez les meilleurs composants compatibles pour booster votre machine.</p>
        <Link href="/a-propos" className="text-white/90 hover:text-white mt-2 fade-in transition-all duration-300" style={{animationDelay:'0.6s'}}>En savoir plus sur PcAnalys</Link>
        <Link href="/diagnostic" className="btn-modern text-lg px-10 py-4 mt-4 slide-up" style={{animationDelay:'0.4s'}}>Commencer le diagnostic</Link>
      </div>
    </div>
  );
}
