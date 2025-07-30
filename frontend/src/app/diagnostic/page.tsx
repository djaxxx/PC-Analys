"use client";
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MemoryStick, HardDrive, ShoppingCart, Image as LucideImage, Sparkles, Search, Settings, Cpu, Gpu, CheckCircle } from 'lucide-react';

const ICONS = {
  Cpu: <Cpu className="w-6 h-6 text-cyan-400" />, 
  Gpu: <Gpu className="w-6 h-6 text-green-400" />, 
  MemoryStick: <MemoryStick className="w-6 h-6 text-purple-400" />, 
  HardDrive: <HardDrive className="w-6 h-6 text-orange-400" />
} as const;

type IconKey = keyof typeof ICONS;

function SkeletonConfigCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 animate-pulse border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-bold text-white text-lg">{title}</span>
      </div>
      <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
      <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
      <div className="h-4 bg-white/10 rounded w-1/4" />
    </div>
  );
}

function SuggestionCard({ s }: { s: any }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  
  // Fonction pour vérifier si l'image est valide
  const checkImageValidity = (imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      setImgLoading(false);
      // Vérifier si l'image est trop petite ou probablement vide
      if (img.width < 50 || img.height < 50) {
        setImgError(true);
      }
    };
    img.onerror = () => {
      setImgError(true);
      setImgLoading(false);
    };
    img.src = imgSrc;
  };

  // Vérifier l'image au montage du composant
  useEffect(() => {
    if (s.image) {
      checkImageValidity(s.image);
    } else {
      setImgLoading(false);
    }
  }, [s.image]);

  // Utilise l'icône Lucide envoyée par le backend si présente, sinon fallback sur la catégorie
  const iconKey: IconKey | undefined = s.icon && (s.icon in ICONS) ? s.icon as IconKey : (s.categorie && s.categorie in ICONS ? s.categorie as IconKey : undefined);
  const icon = iconKey ? ICONS[iconKey] : <HardDrive className="w-6 h-6 text-cyan-400" />;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl flex flex-col md:flex-row items-center gap-4 hover:scale-105 transition-transform p-4 border border-white/10 w-full fade-in">
      <div className="icon-no-bg mr-0 md:mr-2 mb-2 md:mb-0">{icon}</div>
      {s.image && !imgError && imgLoading ? (
        // Loading state
        <div className="w-32 h-32 flex items-center justify-center bg-white/10 rounded flex-shrink-0 mb-2 md:mb-0">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
        </div>
      ) : s.image && !imgError ? (
        <img
          src={s.image}
          alt={s.titre}
          className="w-32 h-32 object-contain rounded bg-white/10 flex-shrink-0 mb-2 md:mb-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-32 h-32 flex flex-col items-center justify-center bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded border border-gray-400/30 flex-shrink-0 mb-2 md:mb-0">
          <LucideImage className="w-8 h-8 text-gray-400 mb-1" />
          <span className="text-xs text-gray-400">Aucune image</span>
        </div>
      )}
      <div className="flex flex-col flex-1 justify-between md:ml-5 h-auto w-full">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-lg font-semibold text-white text-left">{s.titre || s.categorie || s.nom}</div>
            {s.priorite && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                s.priorite === 'Haute' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                s.priorite === 'Moyenne' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {s.priorite}
              </span>
            )}
          </div>
          <div className="text-gray-300 mb-1 text-left">{s.description || s.nom}</div>
          {s.raison && (
            <div className="text-blue-300 mb-1 text-left text-sm italic">💡 {s.raison}</div>
          )}
          {s.prix && <div className="text-cyan-400 mb-1 text-left font-semibold">{s.prix}</div>}
        </div>
        <div className="flex flex-row gap-2 items-center mt-2 flex-wrap">
          {s.amazonUrl && (
            <a
              href={s.amazonUrl}
              className="btn-modern flex flex-row items-center gap-2 w-fit self-start text-sm px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShoppingCart className="w-4 h-4" />
              Voir sur Amazon
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Diagnostic() {
  const [config, setConfig] = useState<any>(null);
  const [reco, setReco] = useState<string>('');
  const [recoDisplay, setRecoDisplay] = useState<string>('');
  const [recoTerminee, setRecoTerminee] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReco, setLoadingReco] = useState(false);

  // Fonction pour générer un identifiant unique de machine basé sur la configuration
  const generateMachineId = (config: any) => {
    // Log la structure de config utilisée pour générer l'ID machine
    console.log('Frontend config pour machineId:', config);
    const cpu = config?.cpu?.modèle || 'unknown';
    const ram = config?.ram?.totale || 'unknown';
    const gpu = config?.gpu?.[0]?.modèle || 'unknown';
    const storage = config?.stockage?.[0]?.type || 'unknown';
    const machineSignature = `${cpu}_${ram}_${gpu}_${storage}`;
    // Encodage base64 UTF-8 identique à Buffer.from(..., 'utf8').toString('base64')
    const utf8 = new TextEncoder().encode(machineSignature);
    let binary = '';
    utf8.forEach(b => binary += String.fromCharCode(b));
    const base64 = btoa(binary);
    const id = base64.substring(0, 16);
    console.log('Frontend machineId:', id);
    return id;
  };
  const [error, setError] = useState<string>('');
  const [analyseLancee, setAnalyseLancee] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Post-traitement pour forcer une structure claire (titres, résumé, tableau)
  function structureRecommandation(raw: string): string {
    let txt = raw.trim();
    if (!/^## Résumé/m.test(txt)) {
      const resumeRegex = /^\s*(#+\s*)?Résumé\s*:?.*$/m;
      const match = txt.match(resumeRegex);
      if (match) {
        txt = txt.replace(resumeRegex, `## Résumé\n${match[0].replace(/^(#+\s*)?Résumé\s*:?\s*/, '')}`);
      } else {
        const firstLine = txt.split('\n').find(l => l.trim() !== '' && !l.startsWith('#')) || '';
        if (firstLine) {
          txt = txt.replace(firstLine, `## Résumé\n${firstLine}`);
        }
      }
    }
    if (txt.includes('|') && !/^## Tableau Récapitulatif/m.test(txt)) {
      txt = txt.replace(/(\n\|)/, '\n## Tableau Récapitulatif$1');
    }
    return txt;
  }

  // Animation de machine à écrire pour l'affichage du texte


  const checkAgentSession = async () => {
    try {
      setLoading(true);
      setError('');
      // Désactive l'appel à /api/scan : on ne récupère que la session agent
      const sessionResponse = await fetch(`${API_BASE_URL}/api/client-sessions/recent`);
      let sessionData = null;
      if (sessionResponse.ok) {
        const data = await sessionResponse.json();
        if (data.sessionId) {
          const sessionResponse2 = await fetch(`${API_BASE_URL}/api/client-session/${data.sessionId}`);
          if (sessionResponse2.ok) {
            const tempSessionData = await sessionResponse2.json();
            // On prend directement la session agent récupérée
            sessionData = tempSessionData;
          }
        }
      }
      
      if (sessionData) {
        setSessionId(sessionData.sessionId);
        setShowAgentOption(false);
        setAnalyseLancee(true);
        setConfig(sessionData.data);
        
        // Lancer l'analyse IA et les suggestions en parallèle
        setLoadingReco(true);
        const [resReco, resSuggestions] = await Promise.all([
          fetch(`${API_BASE_URL}/api/recommandation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData.data),
          }),
          fetch(`${API_BASE_URL}/api/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...sessionData.data,
              iaRecommendation: '' // On l'ajoutera après
            }),
          })
        ]);
        
        if (!resReco.ok) throw new Error('Erreur lors de l\'analyse de l\'IA');
        const recoData = await resReco.json();
        setReco(recoData.recommandation || '');
        animateReco(recoData.recommandation || '');
        
        if (!resSuggestions.ok) throw new Error('Erreur lors de la récupération des suggestions');
        const suggestionsData = await resSuggestions.json();
        setSuggestions(suggestionsData.suggestions || []);
        setMessage(suggestionsData.message || null);
        
        setTimeout(() => setLoadingReco(false), 1000); // Réduit de 2s à 1s
        setLoading(false);
        
        // Sauvegarder dans localStorage
        const analyseData = {
          id: Date.now(),
          date: new Date().toISOString(),
          config: sessionData.data,
          recommandation: recoData.recommandation,
          suggestions: suggestionsData
        };
        const historique = JSON.parse(localStorage.getItem('pcanalys_historique') || '[]');
        historique.unshift(analyseData);
        localStorage.setItem('pcanalys_historique', JSON.stringify(historique.slice(0, 10)));
        setToast('Analyse enregistrée dans l\'historique !');
        setTimeout(() => setToast(null), 3000);
      } else {
        setError('Aucune session agent trouvée pour cette machine. Assurez-vous d\'avoir exécuté l\'agent.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      setError('Aucune session agent trouvée. Assurez-vous d\'avoir exécuté l\'agent.');
      setLoading(false);
    }
  };

  const animateReco = (text: string) => {
    setRecoDisplay('');
    setRecoTerminee(false);
    
    // Séparer le texte en caractères pour l'effet machine à écrire
    const chars = text.split('');
    let current = '';
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < chars.length) {
        current += chars[i];
        setRecoDisplay(current);
        i++;
      } else {
        clearInterval(interval);
        setRecoTerminee(true);
      }
    }, 30); // Vitesse de frappe plus rapide
  };

  // Centralisation de la base URL API - Utiliser l'URL relative
  // Utilise la variable d'environnement pour l'URL de l'API backend
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showAgentOption, setShowAgentOption] = useState(false);

  const analyser = async () => {
    setAnalyseLancee(true);
    setLoading(true);
    setError('');
    setConfig(null);
    setReco('');
    setRecoDisplay('');
    setRecoTerminee(false);
    setSuggestions([]);
    setSessionId(null);
    
    // Toujours proposer l'agent pour une analyse complète
    setShowAgentOption(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 fade-in">
      {/* Toast de succès */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-6 mt-20 mb-10 slide-up w-full max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#06b6d4] via-[#a78bfa] to-[#06b6d4] bg-clip-text text-transparent text-center drop-shadow-lg fade-in">Diagnostic PC</h1>
        <p className="text-lg md:text-xl text-white text-center max-w-2xl fade-in" style={{animationDelay:'0.2s'}}>Découvrez votre configuration actuelle et recevez des recommandations d'amélioration personnalisées.</p>
        
        <button
          className="btn-modern text-lg px-10 py-4 mt-4 slide-up"
          onClick={analyser}
          disabled={loading}
          style={{animationDelay:'0.4s'}}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyse en cours...</span>
            </div>
          ) : (
            'Lancer l\'analyse'
          )}
        </button>
        
        {error && <div className="text-red-400 font-semibold text-center slide-up">{error}</div>}

        {showAgentOption && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 slide-up">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Analyse Avancée Requise</h3>
            <p className="text-white/80 mb-6 text-center">
              Pour obtenir une analyse complète et précise de votre configuration, 
              nous vous proposons de télécharger notre agent local.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  // Télécharger l'agent
                  const link = document.createElement('a');
                  link.href = '/api/download-agent';
                  link.download = 'pcanalys-agent.exe';
                  link.click();
                }}
                className="btn-modern text-lg px-8 py-3"
              >
                📥 Télécharger l'Agent
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <h4 className="text-cyan-400 font-semibold mb-2">Comment utiliser l'agent :</h4>
              <ol className="text-white/80 text-sm space-y-1">
                <li>1. Téléchargez et exécutez l'agent</li>
                <li>2. L'agent analysera votre système</li>
                <li>3. Retournez sur cette page et cliquez sur "Continuer"</li>
                <li>4. Vos données seront automatiquement récupérées</li>
              </ol>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={checkAgentSession}
                className="btn-modern text-sm px-6 py-2"
              >
                🔄 Continuer avec l'Agent
              </button>
            </div>
          </div>
        )}

        {analyseLancee && (
          <div className="w-full space-y-8 mt-8">
            {/* Configuration détectée */}
            <div className="slide-up">
              <h2 className="text-2xl font-bold mb-6 text-white text-center">Votre Configuration</h2>
              {loading && !config ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center gap-3 text-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                      <span className="text-lg">Détection de votre configuration...</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonConfigCard icon={ICONS.Cpu} title="CPU" />
                    <SkeletonConfigCard icon={ICONS.MemoryStick} title="RAM" />
                    <SkeletonConfigCard icon={ICONS.Gpu} title="GPU" />
                    <SkeletonConfigCard icon={ICONS.HardDrive} title="Stockage" />
                  </div>
                </div>
              ) : config ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CPU */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 text-2xl">{ICONS.Cpu}</span>
                      <span className="font-bold text-white text-lg">CPU</span>
                    </div>
                    <div><span className="font-semibold text-cyan-300">Marque :</span> <span className="text-white">{config.cpu?.marque}</span></div>
                    <div><span className="font-semibold text-cyan-300">Modèle :</span> <span className="text-white">{config.cpu?.modèle}</span></div>
                    <div><span className="font-semibold text-cyan-300">Cœurs :</span> <span className="text-white">{config.cpu?.cœurs}</span></div>
                    <div><span className="font-semibold text-cyan-300">Vitesse :</span> <span className="text-white">{config.cpu?.vitesse}</span></div>
                  </div>
                  {/* RAM */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 text-2xl">{ICONS.MemoryStick}</span>
                      <span className="font-bold text-white text-lg">RAM</span>
                    </div>
                    <div><span className="font-semibold text-purple-300">Totale :</span> <span className="text-white">{config.ram?.totale}</span></div>
                    <div><span className="font-semibold text-purple-300">Utilisée :</span> <span className="text-white">{config.ram?.utilisée}</span></div>
                    <div><span className="font-semibold text-purple-300">Type :</span> <span className="text-white">{config.ram?.type}</span></div>
                    <div><span className="font-semibold text-purple-300">Slots :</span> <span className="text-white">{config.ram?.slots_libres} libres / {config.ram?.slots_total} total</span></div>
                  </div>
                  {/* GPU */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400 text-2xl">{ICONS.Gpu}</span>
                      <span className="font-bold text-white text-lg">GPU</span>
                    </div>
                    {config.gpu?.map((gpu: any, index: number) => (
                      <div key={index} className="mb-2">
                        <div><span className="font-semibold text-green-300">Marque :</span> <span className="text-white">{gpu.marque}</span></div>
                        <div><span className="font-semibold text-green-300">Modèle :</span> <span className="text-white">{gpu.modèle}</span></div>
                        <div><span className="font-semibold text-green-300">VRAM :</span> <span className="text-white">{gpu.vram}</span></div>
                      </div>
                    ))}
                  </div>
                  {/* Stockage */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-orange-400 text-2xl">{ICONS.HardDrive}</span>
                      <span className="font-bold text-white text-lg">Stockage</span>
                    </div>
                    {config.stockage?.map((storage: any, index: number) => (
                      <div key={index} className="mb-2">
                        <div><span className="font-semibold text-orange-300">Type :</span> <span className="text-white">{storage.type}</span></div>
                        <div><span className="font-semibold text-orange-300">Taille :</span> <span className="text-white">{storage.taille}</span></div>
                        <div><span className="font-semibold text-orange-300">Interface :</span> <span className="text-white">{storage.interface}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Recommandation IA */}
            <div className="slide-up">
              <h2 className="text-2xl font-bold mb-6 text-white text-center">Analyse & Recommandations</h2>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                {loadingReco ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-white">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                      <span className="text-lg">Analyse IA en cours...</span>
                    </div>
                    <div className="w-full animate-pulse flex flex-col gap-3">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-4 bg-white/10 rounded w-1/2" />
                      <div className="h-4 bg-white/10 rounded w-5/6" />
                    </div>
                  </div>
                ) : reco ? (
                  <div className="prose prose-lg max-w-none text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {recoDisplay || reco}
                    </ReactMarkdown>
                    {!recoTerminee && <span className="inline-block w-2 h-6 bg-cyan-400 ml-1 animate-pulse"></span>}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Message ou Suggestions */}
            {message && (
              <div className="slide-up">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Configuration Optimale</h3>
                      <p className="text-green-700 mt-1">{message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {suggestions.length > 0 && (
              <div className="slide-up">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Composants Recommandés</h2>
                <div className="flex flex-col gap-4">
                  {suggestions.map((s, index) => (
                    <SuggestionCard key={index} s={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 