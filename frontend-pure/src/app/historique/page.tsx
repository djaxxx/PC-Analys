"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Eye, Download, Calendar, Cpu, MemoryStick, Gpu, HardDrive } from 'lucide-react';

interface AnalyseData {
  id: number;
  date: string;
  config: any;
  recommandation: string;
  suggestions: any;
}

export default function Historique() {
  const [historique, setHistorique] = useState<AnalyseData[]>([]);
  const [selectedAnalyse, setSelectedAnalyse] = useState<AnalyseData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const savedHistorique = localStorage.getItem('pcanalys_historique');
    if (savedHistorique) {
      setHistorique(JSON.parse(savedHistorique));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfigSummary = (config: any) => {
    return {
      cpu: config?.cpu?.modèle || 'Non détecté',
      ram: config?.ram?.totale || 'Non détecté',
      gpu: config?.gpu?.[0]?.modèle || 'Non détecté',
      storage: config?.stockage?.length ? `${config.stockage.length} disque(s)` : 'Non détecté'
    };
  };

  const deleteAnalyse = (id: number) => {
    const newHistorique = historique.filter(item => item.id !== id);
    setHistorique(newHistorique);
    localStorage.setItem('pcanalys_historique', JSON.stringify(newHistorique));
  };

  const clearHistorique = () => {
    setHistorique([]);
    localStorage.removeItem('pcanalys_historique');
  };

  const exportHistorique = () => {
    const dataStr = JSON.stringify(historique, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pcanalys-historique-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const ICONS = {
    cpu: <Cpu className="w-4 h-4 text-cyan-400" />,
    ram: <MemoryStick className="w-4 h-4 text-purple-400" />,
    gpu: <Gpu className="w-4 h-4 text-green-400" />,
    storage: <HardDrive className="w-4 h-4 text-orange-400" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Clock className="w-8 h-8 text-cyan-400" />
            Historique des Analyses
          </h1>
          <p className="text-gray-300 text-lg">
            Retrouvez toutes vos analyses précédentes et leurs recommandations
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={exportHistorique}
            disabled={historique.length === 0}
            className="btn-modern flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={clearHistorique}
            disabled={historique.length === 0}
            className="btn-modern flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Vider l'historique
          </button>
        </div>

        {/* Historique List */}
        {historique.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Aucune analyse</h3>
            <p className="text-gray-500">
              Effectuez votre première analyse pour voir l'historique ici
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {historique.map((analyse, index) => {
              const summary = getConfigSummary(analyse.config);
              return (
                <div
                  key={analyse.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <span className="font-semibold text-lg">
                        Analyse #{historique.length - index}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {formatDate(analyse.date)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedAnalyse(analyse);
                          setShowDetails(true);
                        }}
                        className="btn-modern flex items-center gap-2 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30"
                      >
                        <Eye className="w-4 h-4" />
                        Détails
                      </button>
                      <button
                        onClick={() => deleteAnalyse(analyse.id)}
                        className="btn-modern flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      {ICONS.cpu}
                      <span className="truncate">{summary.cpu}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {ICONS.ram}
                      <span className="truncate">{summary.ram}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {ICONS.gpu}
                      <span className="truncate">{summary.gpu}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {ICONS.storage}
                      <span className="truncate">{summary.storage}</span>
                    </div>
                  </div>

                  {/* Recommandation Preview */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-400 mb-2">Recommandation IA</h4>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {analyse.recommandation}
                    </p>
                  </div>

                  {/* Suggestions Count */}
                  {analyse.suggestions?.suggestions?.length > 0 && (
                    <div className="mt-4 text-sm text-gray-400">
                      {analyse.suggestions.suggestions.length} suggestion(s) générée(s)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Détails */}
        {showDetails && selectedAnalyse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Détails de l'Analyse</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Configuration Complète */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-cyan-400">Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CPU */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {ICONS.cpu}
                        <span className="font-semibold">CPU</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><span className="text-gray-400">Marque:</span> {selectedAnalyse.config.cpu?.marque}</div>
                        <div><span className="text-gray-400">Modèle:</span> {selectedAnalyse.config.cpu?.modèle}</div>
                        <div><span className="text-gray-400">Cœurs:</span> {selectedAnalyse.config.cpu?.cœurs}</div>
                        <div><span className="text-gray-400">Vitesse:</span> {selectedAnalyse.config.cpu?.vitesse}</div>
                      </div>
                    </div>

                    {/* RAM */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {ICONS.ram}
                        <span className="font-semibold">RAM</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><span className="text-gray-400">Totale:</span> {selectedAnalyse.config.ram?.totale}</div>
                        <div><span className="text-gray-400">Utilisée:</span> {selectedAnalyse.config.ram?.utilisée}</div>
                        <div><span className="text-gray-400">Type:</span> {selectedAnalyse.config.ram?.type}</div>
                      </div>
                    </div>

                    {/* GPU */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {ICONS.gpu}
                        <span className="font-semibold">GPU</span>
                      </div>
                      <div className="text-sm space-y-1">
                        {selectedAnalyse.config.gpu?.map((gpu: any, index: number) => (
                          <div key={index}>
                            <div><span className="text-gray-400">Marque:</span> {gpu.marque}</div>
                            <div><span className="text-gray-400">Modèle:</span> {gpu.modèle}</div>
                            <div><span className="text-gray-400">VRAM:</span> {gpu.vram}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stockage */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {ICONS.storage}
                        <span className="font-semibold">Stockage</span>
                      </div>
                      <div className="text-sm space-y-1">
                        {selectedAnalyse.config.stockage?.map((storage: any, index: number) => (
                          <div key={index}>
                            <div><span className="text-gray-400">Type:</span> {storage.type}</div>
                            <div><span className="text-gray-400">Taille:</span> {storage.taille}</div>
                            <div><span className="text-gray-400">Interface:</span> {storage.interface}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommandation Complète */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-green-400">Recommandation IA</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                      {selectedAnalyse.recommandation}
                    </pre>
                  </div>
                </div>

                {/* Suggestions */}
                {selectedAnalyse.suggestions?.suggestions?.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-orange-400">Suggestions</h3>
                    <div className="space-y-3">
                      {selectedAnalyse.suggestions.suggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{suggestion.nom}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${
                              suggestion.priorite === 'Haute' ? 'bg-red-600/20 text-red-400' :
                              suggestion.priorite === 'Moyenne' ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-green-600/20 text-green-400'
                            }`}>
                              {suggestion.priorite}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{suggestion.description}</p>
                          <p className="text-xs text-gray-400">{suggestion.raison}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 