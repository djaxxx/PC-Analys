#!/usr/bin/env node

const si = require('systeminformation');
const https = require('https');
const http = require('http');
const url = require('url');
const readline = require('readline');

// Configuration
const SERVER_URL = 'http://localhost:4000'; // À modifier pour la production
const API_ENDPOINT = `${SERVER_URL}/api/client-scan`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function analyzeSystem() {
  log('🔍 PcAnalys Agent - Analyse système en cours...', 'cyan');
  
  try {
    // Collecter toutes les informations système
    const [cpu, mem, graphics, disk, memLayout, os] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.diskLayout(),
      si.memLayout(),
      si.osInfo()
    ]);

    // Structurer les données
    const systemData = {
      timestamp: new Date().toISOString(),
      clientInfo: {
        userAgent: 'PcAnalys-Agent/1.0',
        os: os.platform,
        osVersion: os.release
      },
      cpu: {
        marque: cpu.manufacturer,
        modèle: cpu.brand,
        cœurs: cpu.cores,
        vitesse: cpu.speed + ' GHz'
      },
      ram: {
        totale: (mem.total / (1024 ** 3)).toFixed(2) + ' Go',
        utilisée: (mem.active / (1024 ** 3)).toFixed(2) + ' Go',
        type: memLayout.length > 0 ? memLayout[0].type || 'DDR4' : 'DDR4',
        formFactor: memLayout.length > 0 ? memLayout[0].formFactor || 'UDIMM' : 'UDIMM',
        slots_total: memLayout.length,
        slots_libres: memLayout.filter(r => !r.size || r.size === 0).length
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

    log('✅ Analyse terminée !', 'green');
    log(`📊 CPU: ${systemData.cpu.marque} ${systemData.cpu.modèle}`, 'blue');
    log(`💾 RAM: ${systemData.ram.totale}`, 'blue');
    log(`🎮 GPU: ${systemData.gpu[0]?.modèle || 'Non détecté'}`, 'blue');
    log(`💿 Stockage: ${systemData.stockage.length} disque(s)`, 'blue');

    return systemData;

  } catch (error) {
    log(`❌ Erreur lors de l'analyse: ${error.message}`, 'red');
    throw error;
  }
}

async function sendToServer(data) {
  log('📡 Envoi des données au serveur...', 'yellow');
  
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(API_ENDPOINT);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PcAnalys-Agent/1.0',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(responseData);
            log('✅ Données envoyées avec succès !', 'green');
            log(`🔗 Session ID: ${response.sessionId}`, 'cyan');
            resolve(response);
          } catch (error) {
            reject(new Error('Réponse invalide du serveur'));
          }
        } else {
          reject(new Error(`Erreur serveur: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        log('❌ Impossible de se connecter au serveur', 'red');
        log('💡 Assurez-vous que le serveur PcAnalys est démarré', 'yellow');
      } else {
        log(`❌ Erreur d'envoi: ${error.message}`, 'red');
      }
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout de connexion'));
    });
    
    req.write(postData);
    req.end();
  });
}

async function main() {
  log('🚀 PcAnalys Agent v1.0', 'bright');
  log('================================', 'cyan');
  
  try {
    // Analyser le système
    const systemData = await analyzeSystem();
    
    // Envoyer au serveur
    const result = await sendToServer(systemData);
    
    log('', 'reset');
    log('🎉 Analyse terminée avec succès !', 'green');
    log('📋 Vous pouvez maintenant retourner sur le site web', 'cyan');
    log(`🔗 Ouvrez: ${SERVER_URL.replace('/api', '')}`, 'cyan');
    
  } catch (error) {
    log('', 'reset');
    log('💡 Pour utiliser l\'agent:', 'yellow');
    log('1. Assurez-vous que le serveur PcAnalys est démarré', 'yellow');
    log('2. Relancez cet agent', 'yellow');
    log('3. Ou utilisez la détection côté navigateur', 'yellow');
    
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('PcAnalys Agent - Utilitaire d\'analyse système', 'bright');
  log('', 'reset');
  log('Usage: node pcanalys-agent.js [options]', 'cyan');
  log('', 'reset');
  log('Options:', 'yellow');
  log('  --help, -h     Afficher cette aide', 'reset');
  log('  --server URL   Spécifier l\'URL du serveur', 'reset');
  log('', 'reset');
  process.exit(0);
}

// Détecter l'URL du serveur depuis les arguments
const serverIndex = process.argv.indexOf('--server');
if (serverIndex !== -1 && process.argv[serverIndex + 1]) {
  SERVER_URL = process.argv[serverIndex + 1];
}

// Lancer l'agent
main(); 