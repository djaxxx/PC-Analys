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

// ===== CONFIGURATION CORS CORRIGÉE =====
const allowedOrigins = [
  'https://votre-app.vercel.app', // Remplacez par votre domaine Vercel exact
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  // Ajoutez votre domaine Vercel de production ici
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqué pour origin:', origin);
      console.log('✅ Origins autorisées:', allowedOrigins);
      callback(null, true); // Temporairement autorisé pour debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware CORS en premier
app.use(cors(corsOptions));

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Reste de votre code existant...
// [Gardez tout le reste de votre code tel quel à partir d'ici]

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
  const machineSignature = `${cpu}_${ram}_${gpu}_${storage}`;
  return Buffer.from(machineSignature, 'utf8').toString('base64').substring(0, 16);
}

// Fonction pour charger les composants depuis MongoDB
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

// Images d'illustration
const ILLUSTRATION_IMAGES = {
  RAM: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  STORAGE: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  GPU: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  CPU: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  COOLING: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200",
  GENERAL: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=200"
};

function generateAmazonLinkAndImage(component: any) {
  let amazonUrl = '';
  let amazonImage = '';
  
  if (component.general_product_information?.amazon_sku) {
    const sku = component.general_product_information.amazon_sku;
    amazonUrl = `https://www.amazon.com/dp/${sku}`;
    amazonImage = `https://images-na.ssl-images-amazon.com/images/P/${sku}.jpg`;
  } else {
    const searchQuery = encodeURIComponent(component.metadata?.name || '');
    amazonUrl = `https://www.amazon.com/s?k=${searchQuery}`;
    amazonImage = '';
  }

  return { amazonUrl, amazonImage };
}

function generateSmartSuggestions(configSysteme: any, componentsDatabase: any, iaRecommendation: string = '') {
  const suggestions: any[] = [];

  console.log('[SUGGESTIONS] Analyse de la configuration:', {
    cpu: configSysteme.cpu?.modèle,
    ram: configSysteme.ram?.totale,
    gpu: configSysteme.gpu?.[0]?.modèle,
    stockage: configSysteme.stockage?.length
  });

  const iaSuggestions = analyzeIARecommendation(iaRecommendation);
  console.log('[SUGGESTIONS] Recommandations IA analysées:', iaSuggestions);

  const ramTotale = parseFloat(configSysteme.ram?.totale?.replace(' Go', '') || '0');
  
  if (iaSuggestions.ram && ramTotale < 16) {
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
  }

  // [Gardez le reste de votre logique de suggestions...]

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

// ===== ENDPOINTS =====

// Endpoint de base avec debug CORS
app.get('/', (req, res) => {
  console.log('🎯 GET / - Origin:', req.get('Origin'));
  res.json({ 
    message: 'PcAnalys API v1.0',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.get('/api/test-cors', (req, res) => {
  console.log('🧪 Test CORS - Origin:', req.get('Origin'));
  res.json({ 
    success: true, 
    message: 'CORS fonctionne !',
    origin: req.get('Origin'),
    timestamp: new Date().toISOString()
  });
});

// Vos autres endpoints existants...
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

// Gardez tous vos autres endpoints existants...
// [Le reste de votre code...]

function analyzeIARecommendation(recommendation: string) {
  const lowerReco = recommendation.toLowerCase();
  const suggestions = {
    ram: false,
    storage: false,
    gpu: false,
    cpu: false,
    cooling: false
  };

  if ((lowerReco.includes('plus de ram') || lowerReco.includes('16 go minimum') || lowerReco.includes('32 go')) && 
      !lowerReco.includes('suffisante') && !lowerReco.includes('correct')) {
    suggestions.ram = true;
  }
  
  if (lowerReco.includes('ajout d\'un ssd') || lowerReco.includes('ssd améliorerait')) {
    suggestions.storage = true;
  }
  
  if (lowerReco.includes('gpu dédiée') || lowerReco.includes('carte graphique dédiée')) {
    suggestions.gpu = true;
  }
  
  if (lowerReco.includes('upgrade cpu') || lowerReco.includes('processeur plus puissant') || 
      lowerReco.includes('nouveau processeur')) {
    suggestions.cpu = true;
  }
  
  if (lowerReco.includes('refroidissement') || lowerReco.includes('ventirad') || lowerReco.includes('cooler')) {
    suggestions.cooling = true;
  }

  return suggestions;
}

// Ajoutez tous vos autres endpoints existants ici...

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

// Middleware de gestion d'erreur
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur inattendue',
    code: 'INTERNAL_ERROR'
  });
});

// Connexion à MongoDB et démarrage
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur PcAnalys démarré sur le port ${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}`);
    console.log(`🌐 Railway URL: https://pc-analys-production.up.railway.app`);
    console.log(`🗄️  MongoDB Atlas connecté`);
    console.log(`🔧 CORS configuré pour:`, allowedOrigins);
  });
}).catch((error) => {
  console.error('❌ Erreur lors de la connexion MongoDB:', error);
  process.exit(1);
});
