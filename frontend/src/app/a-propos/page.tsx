import Link from 'next/link';

export default function APropos() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 flex flex-col gap-8">
      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">À propos de PcAnalys</h1>
      <p className="text-lg text-indigo-100">PcAnalys est une application web qui permet d’analyser la configuration de votre PC, d’obtenir des recommandations personnalisées grâce à l’IA, et de découvrir des composants compatibles pour améliorer votre machine.</p>
      <ul className="list-disc list-inside text-indigo-200 text-base pl-4">
        <li>Analyse automatique de votre matériel (CPU, RAM, GPU, stockage…)</li>
        <li>Recommandations IA claires, concises et structurées</li>
        <li>Suggestions de composants compatibles avec liens directs</li>
        <li>Interface moderne, responsive et agréable à utiliser</li>
      </ul>
      <div className="text-indigo-200 text-base">
        <b>Technologies utilisées :</b> Next.js, React, TypeScript, TailwindCSS, API Google Gemini, Express.js, systeminformation…
      </div>
      <div className="text-indigo-200 text-base">
        <b>Contact :</b> <a href="mailto:contact@pcanalys.com" className="underline hover:text-indigo-100">contact@pcanalys.com</a>
      </div>
      <Link href="/" className="btn-modern w-fit mt-4">Retour à l’accueil</Link>
    </div>
  );
} 