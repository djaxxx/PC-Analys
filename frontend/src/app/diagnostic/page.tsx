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
  
  const checkImageValidity = (imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      setImgLoading(false);
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

  useEffect(() => {
    if (s.image) {
      checkImageValidity(s.image);
    } else {
      setImgLoading(false);
    }
  }, [s.image]);

  const iconKey: IconKey | undefined = s.icon && (s.icon in ICONS) ? s.icon as IconKey : (s.categorie && s.categorie in ICONS ? s.categorie as IconKey : undefined);
  const icon = iconKey ? ICONS[iconKey] : <HardDrive className="w-6 h-6 text-cyan-400" />;
  
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl flex flex-col md:flex-row items-center gap-4 hover:scale-105 transition-transform p-4 border border-white/10 w-full fade-in">
      <div className="icon-no-bg mr-0 md:mr-2 mb-2 md:mb-0">{icon}</div>
      {s.image && !imgError && imgLoading ? (
        <div className="w-32 h-32 flex items-center justify-center bg-white/10 rounded flex-shrink-0 mb-2 md:mb-0">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
        </div>
      ) : s.image && !imgError ? (
        <img
          src={s.image}
          alt={s.titre || s.nom || 'Composant'}
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
  const [error, setError] = useState<string>('');
  const [analyseLancee, setAnalyseLancee] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showAgentOption, setShowAgentOption] = useState(false);

  // ===== URL API CORRIGÉE =====
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pc-analys-production.up.railway.app';

  console.log('🔧 API_BASE_URL utilisée:', API_BASE_URL);

  // Fonction pour générer un identifiant unique de machine
  const generateMachineId = (config: any) => {
    console.log('Frontend config pour machineId:', config);
    const cpu = config?.cpu?.modèle || 'unknown';
    const ram = config?.ram?.totale || 'unknown';
    const gpu = config?.gpu?.[0]?.modèle || 'unknown';
    const storage = config?.stockage?.[0]?.type || 'unknown';
    const machineSignature = `${cpu}_${ram}_${gpu}_${storage}`;
    const utf8 = new TextEncoder().encode(machineSignature);
    let binary = '';
    utf8.forEach(b => binary += String.fromCharCode(b));
    const base64 = btoa(binary);
    const id = base64.substring(0, 16);
    console.log('Frontend machineId:', id);
    return id;
  };

  // Post-traitement pour forcer une structure claire
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

  // Test de connectivité API
  const testAPIConnection = async () => {
    try {
      console.log('🧪 Test de connexion API...');
      const response = await fetch(`${API_BASE_URL}/api/test-cors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Test API réussi:', data);
        return true;
      } else {
        console.error('❌ Test API échoué:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur test API:', error);
      return false;
    }
  };

  const checkAgentSession = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Test de connectivité d'abord
      const isConnected = await testAPIConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez la configuration.');
      }

      console.log('🔍 Recherche de session agent...');
      const sessionResponse = await fetch(`${API_BASE_URL}/api/client-sessions/recent`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let sessionData = null;
      
      if (sessionResponse.ok) {
        const data = await sessionResponse.json();
        console.log('📡 Réponse session:', data);
        
        if (data.sessionId) {
          const sessionDetailResponse = await fetch(`${API_BASE_URL}/api/client-session/${data.sessionId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (sessionDetailResponse.ok) {
            const tempSessionData = await sessionDetailResponse.json();
            sessionData = tempSessionData;
            console.log('📊 Données session récupérées:', sessionData);
          }
        }
      }
      
      if (sessionData && sessionData.data) {
        setSessionId(sessionData.sessionId || 'unknown');
        setShowAgentOption(false);
        setAnalyseLancee(true);
        setConfig(sessionData.data);
        
        // Lancer l'analyse IA et les suggestions
        setLoadingReco(true);
        
        try {
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
                iaRecommendation: ''
              }),
            })
          ]);
          
          let recoText = '';
          if (resReco.ok) {
            const recoData = await resReco.json();
            recoText = recoData.recommandation || '';
            setReco(recoText);
            animateReco(recoText);
          }
          
          if (resSuggestions.ok) {
            const suggestionsData = await resSuggestions.json();
            setSuggestions(suggestionsData.suggestions || []);
            setMessage(suggestionsData.message || null);
          }
          
          setLoadingReco(false);
          
          // Sauvegarder dans localStorage
          const analyseData = {
            id: Date.now(),
            date: new Date().toISOString(),
            config: sessionData.data,
            recommandation: recoText,
            suggestions: suggestions
          };
          
          const historique = JSON.parse(localStorage.getItem('pcanalys_historique') || '[]');
          historique.unshift(analyseData);
          localStorage.setItem('pcanalys_historique', JSON.stringify(historique.slice(0, 10)));
          
          setToast('Analyse enregistrée dans l\'historique !');
          setTimeout(() => setToast(null), 3000);
          
        } catch (analysisError) {
          console.error('Erreur lors de l\'analyse:', analysisError);
          setLoadingReco(false);
        }
        
        setLoading(false);
      } else {
        setError('Aucune session agent trouvée pour cette machine. Assurez-vous d\'avoir exécuté l\'agent et attendu qu\'il se termine.');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      setError(`Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setLoading(false);
    }
  };

  const animateReco = (text: string) => {
    setRecoDisplay('');
    setRecoTerminee(false);
    
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
    }, 30);
  };

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
    
    // Test de connectivité d'abord
    console.log('🧪 Test de l\'API backend...');
    const isConnected = await testAPIConnection();
    
    if (!isConnected) {
      setError('Impossible de se connecter au serveur backend. Vérifiez que l\'URL est correcte et que le serveur est démarré.');
      setLoading(false);
      return;
    }
    
    setShowAgentOption(true);
    setLoading(false);
  };

  // Afficher l'URL de l'API pour debug
  useEffect(() => {
    console.log('🔧 Configuration API:', {
      API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    });
  }, [API_BASE_URL]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 fade-in">
      {/* Toast de succès */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-6 mt-20 mb-10 slide-up w-full max-w-5xl">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-[#06b6d4] via-[#a78bfa] to-[#06b6d4] bg-clip-text text-transparent text-center drop-shadow-lg fade-in">
          Diagnostic PC
        </h1>
        <p className="text-lg md:text-xl text-white text-center max-w-2xl fade-in" style={{animationDelay:'0.2s'}}>
          Découvrez votre configuration actuelle et recevez des recommandations d'amélioration personnalisées.
        </p>
        
        {/* Affichage debug de l'URL API */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 text-center">
            API: {API_BASE_URL || 'Non configuré'}
          </div>
        )}
        
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
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-w-2xl">
            <div className="text-red-400 font-semibold text-center mb-2">Erreur de connexion</div>
            <div className="text-red-300 text-sm text-center">{error}</div>
            {API_BASE_URL && (
              <div className="text-gray-400 text-xs text-center mt-2">
                Serveur cible: {API_BASE_URL}
              </div>
            )}
          </div>
        )}

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
                  const link = document.createElement('a');
                  link.href = `${API_BASE_URL}/api/download-agent`;
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
                <li>3. Attendez que l'agent indique "Analyse terminée avec succès !"</li>
                <li>4. Retournez sur cette page et cliquez sur "Continuer"</li>
              </ol>
            </div>
            
            <div className="mt-4 flex justify-center">
              <button
                onClick={checkAgentSession}
                className="btn-modern text-sm px-6 py-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Vérification...</span>
                  </div>
                ) : (
                  '🔄 Continuer avec l\'Agent'
                )}
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
                    {config.ram?.slots_total && (
                      <div><span className="font-semibold text-purple-300">Slots :</span> <span className="text-white">{config.ram?.slots_libres || 0} libres / {config.ram?.slots_total} total</span></div>
                    )}
                  </div>
                  {/* GPU */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400 text-2xl">{ICONS.Gpu}</span>
                      <span className="font-bold text-white text-lg">GPU</span>
                    </div>
                    {config.gpu && config.gpu.length > 0 ? config.gpu.map((gpu: any, index: number) => (
                      <div key={index} className="mb-2">
                        <div><span className="font-semibold text-green-300">Marque :</span> <span className="text-white">{gpu.marque}</span></div>
                        <div><span className="font-semibold text-green-300">Modèle :</span> <span className="text-white">{gpu.modèle}</span></div>
                        <div><span className="font-semibold text-green-300">VRAM :</span> <span className="text-white">{gpu.vram}</span></div>
                      </div>
                    )) : (
                      <div className="text-white">Aucun GPU détecté</div>
                    )}
                  </div>
                  {/* Stockage */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 flex flex-col gap-2 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-orange-400 text-2xl">{ICONS.HardDrive}</span>
                      <span className="font-bold text-white text-lg">Stockage</span>
                    </div>
                    {config.stockage && config.stockage.length > 0 ? config.stockage.map((storage: any, index: number) => (
                      <div key={index} className="mb-2">
                        <div><span className="font-semibold text-orange-300">Type :</span> <span className="text-white">{storage.type}</span></div>
                        <div><span className="font-semibold text-orange-300">Taille :</span> <span className="text-white">{storage.taille}</span></div>
                        <div><span className="font-semibold text-orange-300">Interface :</span> <span className="text-white">{storage.interface}</span></div>
                      </div>
                    )) : (
                      <div className="text-white">Aucun stockage détecté</div>
                    )}
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
                    <div className="text-gray-300 text-center">
                      Génération de recommandations personnalisées basées sur votre configuration...
                    </div>
                  </div>
                ) : recoDisplay ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold text-cyan-400 mb-3 mt-6">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-semibold text-purple-400 mb-2 mt-4">{children}</h3>,
                        p: ({ children }) => <p className="text-gray-300 mb-3 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-300">{children}</li>,
                        table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse border border-gray-600">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                        th: ({ children }) => <th className="border border-gray-600 px-4 py-2 text-left text-cyan-400 font-semibold">{children}</th>,
                        td: ({ children }) => <td className="border border-gray-600 px-4 py-2 text-gray-300">{children}</td>,
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="text-cyan-300 italic">{children}</em>,
                        code: ({ children }) => <code className="bg-gray-800 px-2 py-1 rounded text-cyan-400">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-400 pl-4 italic text-gray-300 mb-4">{children}</blockquote>
                      }}
                    >
                      {structureRecommandation(recoDisplay)}
                    </ReactMarkdown>
                    {!recoTerminee && (
                      <span className="inline-block w-2 h-5 bg-cyan-400 animate-pulse ml-1"></span>
                    )}
                  </div>
                ) : config && !loadingReco ? (
                  <div className="text-center text-gray-300">
                    <div className="mb-4">
                      <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                      <p>Prêt à générer vos recommandations personnalisées</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Suggestions d'amélioration */}
            {(suggestions.length > 0 || message) && (
              <div className="slide-up">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Suggestions d'Amélioration</h2>
                
                {message && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Excellente configuration !</span>
                    </div>
                    <div className="text-green-300 mt-2">{message}</div>
                  </div>
                )}
                
                {suggestions.length > 0 && (
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <SuggestionCard key={suggestion.id || index} s={suggestion} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section historique et options */}
            {config && (
              <div className="slide-up">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">Options</h3>
                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify({
                          config,
                          recommandation: reco,
                          suggestions,
                          sessionId,
                          date: new Date().toISOString()
                        }, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `pcanalys-diagnostic-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="btn-modern text-sm px-6 py-2"
                    >
                      📥 Exporter l'analyse
                    </button>
                    
                    <button
                      onClick={() => {
                        setAnalyseLancee(false);
                        setConfig(null);
                        setReco('');
                        setRecoDisplay('');
                        setRecoTerminee(false);
                        setSuggestions([]);
                        setMessage(null);
                        setSessionId(null);
                        setShowAgentOption(false);
                        setError('');
                      }}
                      className="btn-modern text-sm px-6 py-2 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30"
                    >
                      🔄 Nouvelle analyse
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
