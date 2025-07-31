import express from 'express';
import cors from 'cors';
import si from 'systeminformation';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Import des nouvelles routes MongoDB
import partsRoutes from './routes/parts';
import { connectDB } from './db';


dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000');

// Middleware
app.use(cors());
app.use(express.json());


// Typage strict pour la configuration système reçue
interface CpuConfig {
  marque: string;
  modèle: string;
  cœurs: number;
  vitesse: string;
}
interface RamConfig {
  totale: string;
  utilisée: string;
  type: string;
}
interface GpuConfig {
  marque: string;
  modèle: string;
  vram: string;
}
interface StorageConfig {
  type: string;
  interface: string;
  capacité: string;
}
interface SystemConfig {
  cpu: CpuConfig;
  ram: RamConfig;
  gpu: GpuConfig[];
  stockage: StorageConfig[];
}
interface ClientSession {
  data: SystemConfig;
  timestamp: Date;
  status: 'completed' | 'pending';
  machineId: string;
}

declare global {
  var clientSessions: Map<string, ClientSession> | undefined;
}

if (!global.clientSessions) {
  global.clientSessions = new Map();
}

// Fonction pour générer un identifiant unique de machine basé sur les caractéristiques système
function generateMachineId(clientData: any): string {
  const cpu = clientData.cpu?.modèle || 'unknown';
  const ram = clientData.ram?.totale || 'unknown';
  const gpu = clientData.gpu?.[0]?.modèle || 'unknown';
  const storage = clientData.stockage?.[0]?.type || 'unknown';
  // Créer un hash simple basé sur les caractéristiques principales
  const machineSignature = `${cpu}_${ram}_${gpu}_${storage}`;
  // Encoder en Base64 de manière sûre pour les caractères Unicode
  return Buffer.from(machineSignature, 'utf8').toString('base64').substring(0, 16);
}

// Fonction pour charger les composants depuis la base de données
// Nouvelle fonction pour charger les composants depuis MongoDB
import { cpuService, gpuService, ramService, storageService, motherboardService, cpuCoolerService } from './services/partsService';

async function loadComponentsFromMongo() {
  const [CPU, GPU, RAM, Storage, CPUCooler, Motherboard] = await Promise.all([
    cpuService.getAll(),
    gpuService.getAll(),
    ramService.getAll(),
    storageService.getAll(),
    cpuCoolerService.getAll(),
    motherboardService.getAll()
  ]);
  return { CPU, GPU, RAM, Storage, CPUCooler, Motherboard };
}

// Images d'illustration de haute qualité pour chaque catégorie de composants
const ILLUSTRATION_IMAGES = {
  // RAM - Image de barrettes de mémoire
  RAM: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  
  // Stockage - Image de SSD/Disque dur
  STORAGE: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  
  // GPU - Image de carte graphique
  GPU: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  
  // CPU - Image de processeur
  CPU: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  
  // Refroidissement - Image de ventirad/refroidissement
  COOLING: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  
  // Général - Image de PC/Composants
  GENERAL: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200"
};

// Fonction pour générer le lien Amazon et l'image du produit
function generateAmazonLinkAndImage(component: any) {
  let amazonUrl = '';
  let amazonImage = '';
  
  // Priorité au SKU Amazon
  if (component.general_product_information?.amazon_sku) {
    const sku = component.general_product_information.amazon_sku;
    amazonUrl = `https://www.amazon.com/dp/${sku}`;
    // Image Amazon basée sur le SKU
    amazonImage = `https://images-na.ssl-images-amazon.com/images/P/${sku}.jpg`;
  } else {
    // Recherche Amazon basée sur le nom du produit
    const searchQuery = encodeURIComponent(component.metadata?.name || '');
    amazonUrl = `https://www.amazon.com/s?k=${searchQuery}`;
    // Pas d'image spécifique pour les recherches
    amazonImage = '';
  }

  return { amazonUrl, amazonImage };
}

// Fonction pour analyser la configuration et générer des suggestions intelligentes
function generateSmartSuggestions(configSysteme: any, componentsDatabase: any, iaRecommendation: string = '') {
  const suggestions: any[] = [];

  console.log('[SUGGESTIONS] Analyse de la configuration:', {
    cpu: configSysteme.cpu?.modèle,
    ram: configSysteme.ram?.totale,
    gpu: configSysteme.gpu?.[0]?.modèle,
    stockage: configSysteme.stockage?.length
  });

  // Analyser la recommandation IA pour déterminer quels composants suggérer
  const iaSuggestions = analyzeIARecommendation(iaRecommendation);
  console.log('[SUGGESTIONS] Recommandations IA analysées:', iaSuggestions);

  const ramTotale = parseFloat(configSysteme.ram?.totale?.replace(' Go', '') || '0');
  const ramType = configSysteme.ram?.type?.toLowerCase() || '';
  
  if (iaSuggestions.ram && ramTotale < 16) {
    // Chercher des kits RAM 16GB
    const ram16GB = componentsDatabase.RAM.filter((ram: any) => 
      ram.capacity >= 16 && ram.capacity <= 32 && 
      ram.ram_type?.toLowerCase().includes('ddr4')
    ).slice(0, 3);

    ram16GB.forEach((ram: any) => {
      const { amazonUrl, amazonImage } = generateAmazonLinkAndImage(ram);
      suggestions.push({
        id: ram.opendb_id,
        nom: ram.metadata?.name,
        prix: "Prix variable",
        categorie: "RAM",
        icon: "MemoryStick",
        image: amazonImage || ILLUSTRATION_IMAGES.RAM,
        description: `Upgrade de ${configSysteme.ram?.totale} vers ${ram.capacity}GB ${ram.ram_type}`,
        priorite: "Haute",
        raison: "RAM insuffisante pour les applications modernes",
        specifications: {
          capacity: ram.capacity,
          speed: ram.speed,
          type: ram.ram_type,
          latency: ram.cas_latency
        },
        amazonUrl: amazonUrl
      });
    });
  } else if (iaSuggestions.ram && ramTotale < 32) {
    // Chercher des kits RAM 32GB
    const ram32GB = componentsDatabase.RAM.filter((ram: any) => 
      ram.capacity >= 32 && ram.capacity <= 64
    ).slice(0, 3);

    ram32GB.forEach((ram: any) => {
      const { amazonUrl, amazonImage } = generateAmazonLinkAndImage(ram);
      suggestions.push({
        id: ram.opendb_id,
        nom: ram.metadata?.name,
        prix: "Prix variable",
        categorie: "RAM",
        icon: "MemoryStick",
        image: amazonImage || ILLUSTRATION_IMAGES.RAM,
        description: `Upgrade de ${configSysteme.ram?.totale} vers ${ram.capacity}GB ${ram.ram_type}`,
        priorite: "Moyenne",
        raison: "Plus de RAM pour de meilleures performances",
        specifications: {
          capacity: ram.capacity,
          speed: ram.speed,
          type: ram.ram_type,
          latency: ram.cas_latency
        },
        amazonUrl: amazonUrl
      });
    });
  }

  // Analyser le stockage - seulement si recommandé par l'IA
  const hasSSD = configSysteme.stockage?.some((s: any) => s.type?.toLowerCase().includes('ssd'));
  if (iaSuggestions.storage && !hasSSD) {
    // Chercher des SSD
    const ssds = componentsDatabase.Storage.filter((storage: any) => 
      storage.metadata?.name?.toLowerCase().includes('ssd') ||
      storage.metadata?.name?.toLowerCase().includes('nvme')
    ).slice(0, 3);

    ssds.forEach((ssd: any) => {
      const { amazonUrl, amazonImage } = generateAmazonLinkAndImage(ssd);
      suggestions.push({
        id: ssd.opendb_id,
        nom: ssd.metadata?.name,
        prix: "Prix variable",
        categorie: "STORAGE",
        icon: "HardDrive",
        image: amazonImage || ILLUSTRATION_IMAGES.STORAGE,
        description: "SSD pour améliorer drastiquement les performances",
        priorite: "Haute",
        raison: "Aucun SSD détecté - amélioration majeure des performances",
        specifications: {
          capacity: ssd.capacity,
          type: ssd.metadata?.name?.includes('NVMe') ? 'NVMe SSD' : 'SATA SSD'
        },
        amazonUrl: amazonUrl
      });
    });
  }

  // Analyser le GPU - seulement si recommandé par l'IA
  const gpu = configSysteme.gpu?.[0];
  const isIntegratedGPU = gpu?.modèle?.toLowerCase().includes('intel') || 
                         gpu?.modèle?.toLowerCase().includes('amd radeon') ||
                         gpu?.modèle?.toLowerCase().includes('uhd') ||
                         gpu?.modèle?.toLowerCase().includes('vega');
  
  if (iaSuggestions.gpu && isIntegratedGPU) {
    // Chercher des cartes graphiques dédiées
    const dedicatedGPUs = componentsDatabase.GPU.filter((gpu: any) => 
      gpu.memory >= 6000 && // Au moins 6GB VRAM
      !gpu.metadata?.name?.toLowerCase().includes('intel') &&
      !gpu.metadata?.name?.toLowerCase().includes('uhd')
    ).slice(0, 3);

    dedicatedGPUs.forEach((gpu: any) => {
      const { amazonUrl, amazonImage } = generateAmazonLinkAndImage(gpu);
      suggestions.push({
        id: gpu.opendb_id,
        nom: gpu.metadata?.name,
        prix: "Prix variable",
        categorie: "GPU",
        icon: "Gpu",
        image: amazonImage || ILLUSTRATION_IMAGES.GPU,
        description: "Carte graphique dédiée pour le gaming",
        priorite: "Haute",
        raison: "GPU intégré détecté - upgrade majeur pour le gaming",
        specifications: {
          memory: gpu.memory,
          memory_type: gpu.memory_type,
          chipset: gpu.chipset,
          boost_clock: gpu.core_boost_clock
        },
        amazonUrl: amazonUrl
      });
    });
  } else if (iaSuggestions.gpu) {
    // Analyser la VRAM
    const vram = parseInt(gpu?.vram?.replace(' Mo', '') || '0');
    if (vram < 6000) {
      // Chercher des cartes avec plus de VRAM
      const betterGPUs = componentsDatabase.GPU.filter((gpu: any) => 
        gpu.memory >= 8000 && // Au moins 8GB VRAM
        gpu.memory > vram
      ).slice(0, 3);

      betterGPUs.forEach((gpu: any) => {
        const { amazonUrl, amazonImage } = generateAmazonLinkAndImage(gpu);
        suggestions.push({
          id: gpu.opendb_id,
          nom: gpu.metadata?.name,
          prix: "Prix variable",
          categorie: "GPU",
          icon: "Gpu",
          image: amazonImage || ILLUSTRATION_IMAGES.GPU,
          description: `Upgrade de ${vram}MB vers ${gpu.memory}MB VRAM`,
          priorite: "Moyenne",
          raison: "VRAM insuffisante pour le gaming moderne",
          specifications: {
            memory: gpu.memory,
            memory_type: gpu.memory_type,
            chipset: gpu.chipset,
            boost_clock: gpu.core_boost_clock
          },
          amazonUrl: amazonUrl
        });
      });
    }
  }

  // Analyser le CPU - seulement si recommandé par l'IA
  const cpu = configSysteme.cpu?.modèle?.toLowerCase() || '';
  const isOldCPU = cpu.includes('i3') || cpu.includes('ryzen 3') || 
                   cpu.includes('i5-') && parseInt(cpu.match(/i5-(\d+)/)?.[1] || '0') < 8000 ||
                   cpu.includes('ryzen 5') && parseInt(cpu.match(/ryzen 5 (\d+)/)?.[1] || '0') < 3000;
  
  if (iaSuggestions.cpu && isOldCPU) {
    // Chercher des CPU modernes
    const modernCPUs = componentsDatabase.CPU.filter((cpu: any) => 
      cpu.cores?.total >= 6 && // Au moins 6 cœurs
      (cpu.metadata?.name?.toLowerCase().includes('i5') || 
       cpu.metadata?.name?.toLowerCase().includes('i7') ||
       cpu.metadata?.name?.toLowerCase().includes('ryzen 5') ||
       cpu.metadata?.name?.toLowerCase().includes('ryzen 7'))
    ).slice(0, 3);

    modernCPUs.forEach((cpu: any) => {
      const { amazonUrl, amazonImage } = generateAmazonLinkAndImage(cpu);
      suggestions.push({
        id: cpu.opendb_id,
        nom: cpu.metadata?.name,
        prix: "Prix variable",
        categorie: "CPU",
        icon: "Cpu",
        image: amazonImage || ILLUSTRATION_IMAGES.CPU,
        description: "Processeur moderne pour de meilleures performances",
        priorite: "Moyenne",
        raison: "CPU ancien détecté - upgrade recommandé",
        specifications: {
          cores: cpu.cores?.total,
          threads: cpu.cores?.threads,
          base_clock: cpu.clocks?.performance?.base,
          boost_clock: cpu.clocks?.performance?.boost
        },
        amazonUrl: amazonUrl
      });
    });
  }

    // Si aucune suggestion, retourner un message informatif
  if (suggestions.length === 0) {
    return {
      message: "Votre configuration est déjà très bonne ! Aucune amélioration majeure n'est nécessaire selon l'analyse.",
      suggestions: []
    };
  }

  return {
    message: null as string | null,
    suggestions: suggestions
  };
}

// Endpoint de base
app.get('/', (req, res) => {
  res.json({ message: 'PcAnalys API v1.0' });
});

// Endpoint pour l'analyse système locale (serveur)
app.get('/api/scan', async (req, res) => {
  try {
    console.log('[SCAN] Analyse système demandée...');
    
    const [cpu, mem, graphics, disk, memLayout, os] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.diskLayout(),
      si.memLayout(),
      si.osInfo()
    ]);

    const configSysteme = {
      cpu: {
        marque: cpu.manufacturer,
        modèle: cpu.brand,
        cœurs: cpu.cores,
        vitesse: cpu.speed + ' GHz'
      },
      ram: {
        totale: (mem.total / (1024 ** 3)).toFixed(2) + ' Go',
        utilisée: (mem.active / (1024 ** 3)).toFixed(2) + ' Go',
        type: memLayout.length > 0 ? memLayout[0].type || 'DDR4' : 'DDR4'
      },
      gpu: graphics.controllers.map(gpu => ({
        marque: gpu.vendor,
        modèle: gpu.model,
        vram: gpu.vram + ' Mo'
      })),
      stockage: disk.map(d => ({
        type: d.type,
        interface: d.interfaceType,
        taille: (d.size / (1024 ** 3)).toFixed(2) + ' Go',
        nom: d.name
      }))
    };

    console.log('[SCAN] Configuration détectée:', {
      cpu: configSysteme.cpu.modèle,
      ram: configSysteme.ram.totale,
      gpu: configSysteme.gpu[0]?.modèle
    });

    res.json(configSysteme);

  } catch (error) {
    console.error('[ERROR /api/scan]', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse système' });
  }
});

// Endpoint pour recevoir les données de l'agent local
// Validation basique de la config reçue (à remplacer par zod/joi pour la prod)
function isValidSystemConfig(obj: any): obj is SystemConfig {
  return obj && typeof obj === 'object'
    && obj.cpu && typeof obj.cpu.marque === 'string' && typeof obj.cpu.modèle === 'string'
    && typeof obj.cpu.cœurs === 'number' && typeof obj.cpu.vitesse === 'string'
    && obj.ram && typeof obj.ram.totale === 'string' && typeof obj.ram.utilisée === 'string' && typeof obj.ram.type === 'string'
    && Array.isArray(obj.gpu) && Array.isArray(obj.stockage);
}

app.post('/api/client-scan', async (req, res) => {
  try {
    const clientData = req.body;
    if (!isValidSystemConfig(clientData)) {
      return res.status(400).json({ success: false, error: 'Configuration système invalide ou incomplète.' });
    }
    // Générer un ID de session unique
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Générer l'identifiant de machine
    const machineId = generateMachineId(clientData);
    // Stocker les données
    if (global.clientSessions) {
      global.clientSessions.set(sessionId, {
        data: clientData,
        timestamp: new Date(),
        status: 'completed',
        machineId: machineId
      });
      // Nettoyer les anciennes sessions (garder seulement les 50 dernières)
      if (global.clientSessions.size > 50) {
        const entries = Array.from(global.clientSessions.entries());
        entries.slice(0, entries.length - 50).forEach(([key]) => {
          global.clientSessions!.delete(key);
        });
      }
    }
    console.log(`[CLIENT-SCAN] Session ${sessionId} reçue:`, {
      cpu: clientData.cpu?.modèle,
      ram: clientData.ram?.totale,
      gpu: clientData.gpu?.[0]?.modèle
    });
    res.json({
      success: true,
      sessionId: sessionId,
      message: 'Données reçues avec succès'
    });
  } catch (error) {
    console.error('[ERROR /api/client-scan]', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du traitement des données client'
    });
  }
});

// Endpoint pour récupérer la session la plus récente pour une machine spécifique
app.get('/api/client-sessions/recent', async (req, res) => {
  try {
    const { machineId } = req.query;
    
    if (!global.clientSessions || global.clientSessions.size === 0) {
      return res.status(404).json({
        success: false,
        error: 'Aucune session trouvée'
      });
    }
    
    // Si un machineId est fourni, chercher la session la plus récente pour cette machine
    if (machineId) {
      let mostRecentSession = null;
      let mostRecentId = null;
      
      for (const [sessionId, session] of global.clientSessions.entries()) {
        if (session.machineId === machineId) {
          if (!mostRecentSession || session.timestamp > mostRecentSession.timestamp) {
            mostRecentSession = session;
            mostRecentId = sessionId;
          }
        }
      }
      
      if (!mostRecentSession) {
        return res.status(404).json({
          success: false,
          error: 'Aucune session trouvée pour cette machine'
        });
      }
      
      // Vérifier si la session n'est pas trop ancienne (24h)
      const sessionAge = Date.now() - mostRecentSession.timestamp.getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        global.clientSessions?.delete(mostRecentId!);
        return res.status(404).json({
          success: false,
          error: 'Session expirée'
        });
      }
      
      return res.json({
        success: true,
        sessionId: mostRecentId,
        timestamp: mostRecentSession.timestamp,
        machineId: mostRecentSession.machineId
      });
    }
    
    // Si aucun machineId fourni, retourner la session la plus récente (comportement par défaut)
    let mostRecentSession = null;
    let mostRecentId = null;
    
    for (const [sessionId, session] of global.clientSessions.entries()) {
      if (!mostRecentSession || session.timestamp > mostRecentSession.timestamp) {
        mostRecentSession = session;
        mostRecentId = sessionId;
      }
    }
    
    // Vérifier si la session n'est pas trop ancienne (24h)
    if (mostRecentSession && mostRecentId) {
      const sessionAge = Date.now() - mostRecentSession.timestamp.getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        global.clientSessions?.delete(mostRecentId);
        return res.status(404).json({
          success: false,
          error: 'Session expirée'
        });
      }
    }
    
    res.json({
      success: true,
      sessionId: mostRecentId,
      timestamp: mostRecentSession?.timestamp
    });
    
  } catch (error) {
    console.error('[ERROR /api/client-sessions/recent]', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la session'
    });
  }
});

// Endpoint pour récupérer les données d'une session
app.get('/api/client-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!global.clientSessions || !global.clientSessions.has(sessionId)) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }
    
    const session = global.clientSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }
    
    // Vérifier si la session n'est pas trop ancienne (24h)
    const sessionAge = Date.now() - session.timestamp.getTime();
    if (sessionAge > 24 * 60 * 60 * 1000) {
      global.clientSessions?.delete(sessionId);
      return res.status(404).json({
        success: false,
        error: 'Session expirée'
      });
    }
    
    res.json({
      success: true,
      data: session.data,
      timestamp: session.timestamp
    });
    
  } catch (error) {
    console.error('[ERROR /api/client-session]', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la session'
    });
  }
});

// Endpoint de recommandation IA
app.post('/api/recommandation', async (req, res) => {
  try {
    const configSysteme = req.body;
    
    // Simplifier la configuration pour l'IA
    const configSimplifiee = {
      cpu: configSysteme.cpu?.modèle || 'Non détecté',
      ram: `${configSysteme.ram?.totale || '0'} (${configSysteme.ram?.type || 'Non détecté'})`,
      gpu: configSysteme.gpu?.[0]?.modèle || 'Non détecté',
      stockage: configSysteme.stockage?.[0]?.taille || 'Non détecté'
    };

    const prompt = `
      Configuration PC: 
      - CPU : ${configSimplifiee.cpu}
      - RAM : ${configSimplifiee.ram}
      - GPU : ${configSimplifiee.gpu}
      - Stockage : ${configSimplifiee.stockage}

      Merci de donner une recommandation en français pour améliorer cette configuration.
      `;

    // Simulation d'une réponse IA (remplacer par l'API Gemini)
    const recommandation = `## Analyse de votre configuration

**CPU**: ${configSimplifiee.cpu} - Bon processeur pour les tâches quotidiennes
**RAM**: ${configSimplifiee.ram} - Capacité suffisante pour la plupart des usages
**GPU**: ${configSimplifiee.gpu} - Carte graphique intégrée, adaptée au travail bureautique
**Stockage**: ${configSimplifiee.stockage} - Espace de stockage correct

### Recommandations d'amélioration :

1. **Ajout d'un SSD** : Si vous n'en avez pas déjà un, un SSD améliorerait significativement les performances
2. **Plus de RAM** : 16 Go minimum pour les applications modernes
3. **GPU dédiée** : Pour le gaming ou les applications graphiques intensives

Votre configuration est équilibrée pour un usage bureautique et multimédia.`;

    res.json({ recommandation });

  } catch (error) {
    console.error('[ERROR /api/recommandation]', error);
    res.status(500).json({ error: 'Erreur lors de l\'analyse IA' });
  }
});

// Endpoint pour télécharger l'agent
app.get('/api/download-agent', async (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    
    // Chemin vers l'agent (depuis le dossier agent)
    const agentPath = path.join(__dirname, '..', '..', 'agent', 'pcanalys-agent.exe');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(agentPath)) {
      return res.status(404).json({
        success: false,
        error: 'Agent non trouvé. Veuillez construire l\'agent d\'abord.',
        code: 'NOT_FOUND'
      });
    }
    // Envoyer le fichier
    res.download(agentPath, 'pcanalys-agent.exe');
  } catch (error) {
    console.error('[ERROR /api/download-agent]', error);
    res.status(500).json({ success: false, error: 'Erreur lors du téléchargement', code: 'INTERNAL_ERROR' });
  }
});
// Middleware global de gestion d'erreur (doit être à la fin)
import { Request, Response, NextFunction } from 'express';
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur inattendue',
    code: 'INTERNAL_ERROR'
  });
});




// Fonction pour analyser la recommandation IA et déterminer quels composants suggérer
function analyzeIARecommendation(recommendation: string) {
  const lowerReco = recommendation.toLowerCase();
  const suggestions = {
    ram: false,
    storage: false,
    gpu: false,
    cpu: false,
    cooling: false
  };

  // Analyser les mots-clés dans la recommandation avec plus de précision
  // RAM - seulement si explicitement recommandé pour upgrade
  if ((lowerReco.includes('plus de ram') || lowerReco.includes('16 go minimum') || lowerReco.includes('32 go')) && 
      !lowerReco.includes('suffisante') && !lowerReco.includes('correct')) {
    suggestions.ram = true;
  }
  
  // Stockage - seulement si SSD explicitement recommandé
  if (lowerReco.includes('ajout d\'un ssd') || lowerReco.includes('ssd améliorerait')) {
    suggestions.storage = true;
  }
  
  // GPU - seulement si GPU dédié explicitement recommandé
  if (lowerReco.includes('gpu dédiée') || lowerReco.includes('carte graphique dédiée')) {
    suggestions.gpu = true;
  }
  
  // CPU - seulement si explicitement recommandé pour upgrade
  if (lowerReco.includes('upgrade cpu') || lowerReco.includes('processeur plus puissant') || 
      lowerReco.includes('nouveau processeur')) {
    suggestions.cpu = true;
  }
  
  // Refroidissement - seulement si explicitement recommandé
  if (lowerReco.includes('refroidissement') || lowerReco.includes('ventirad') || lowerReco.includes('cooler')) {
    suggestions.cooling = true;
  }

  return suggestions;
}

// Endpoint pour les suggestions de composants intelligentes
app.post('/api/suggestions', async (req, res) => {
  try {
    const configSysteme = req.body;
    const iaRecommendation = req.body.iaRecommendation || '';
    const componentsDatabase = await loadComponentsFromMongo();
    const result = generateSmartSuggestions(configSysteme, componentsDatabase, iaRecommendation);
    console.log('[SUGGESTIONS] Résultat:', result);
    res.json(result);
  } catch (error) {
    console.error('[ERROR /api/suggestions]', error);
    res.status(500).json({ error: 'Erreur lors de la génération des suggestions' });
  }
});

// Ajout des nouvelles routes MongoDB
app.use('/api/parts', partsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: 'connected'
  });
});

// Connexion à MongoDB Atlas au démarrage
connectDB().then(() => {
  // Démarrage du serveur
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur PcAnalys démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
    console.log(`🌐 Accessible depuis le réseau sur http://0.0.0.0:${PORT}`);
    console.log(`🗄️  MongoDB Atlas connecté`);
  });
}).catch((error) => {
  console.error('❌ Erreur lors de la connexion MongoDB:', error);
  process.exit(1);
}); 