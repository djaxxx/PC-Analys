#!/usr/bin/env node

const si = require('systeminformation');
const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Support .env pour la config
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ===== URL BACKEND CORRIGÉE =====
let SERVER_URL = process.env.SERVER_URL || 'https://pc-analys-production.up.railway.app';

// Gestion des arguments de ligne de commande
const serverIndex = process.argv.indexOf('--server');
if (serverIndex !== -1 && process.argv[serverIndex + 1]) {
  SERVER_URL = process.argv[serverIndex + 1];
}

const API_ENDPOINT = `${SERVER_URL}/api/client-scan`;

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fonction pour générer un identifiant unique de machine basé sur les caractéristiques système
function generateMachineId(clientData) {
  const cpu = clientData.cpu?.modèle || 'unknown';
  const ram = clientData.ram?.totale || 'unknown';
  const gpu = clientData.gpu?.[0]?.modèle || 'unknown';
  const storage = clientData.stockage?.[0]?.type || 'unknown';
  const machineSignature = `${cpu}_${ram}_${gpu}_${storage}`;
  return Buffer.from(machineSignature, 'utf8').toString('base64').substring(0, 16);
}

async function analyzeSystem() {
  log('🔍 PcAnalys Agent - Analyse système en cours...', 'cyan');
  
  try {
    // Collecter les informations système
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
  log(`🎯 URL de destination: ${API_ENDPOINT}`, 'cyan');
  
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
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json'
      },
      timeout: 15000, // Augmenté à 15s
      rejectUnauthorized: true // Activé pour la sécurité
    };

    console.log('📤 Options de requête:', {
      hostname: options.hostname,
      port: options.port,
      path: options.path,
      method: options.method
    });

    const req = client.request(options, (res) => {
      let responseData = '';
      
      console.log('📥 Status:', res.statusCode);
      console.log('📥 Headers:', res.headers);
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📥 Response body:', responseData);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(responseData);
            log('✅ Données envoyées avec succès !', 'green');
            log(`🔗 Session ID: ${response.sessionId || 'N/A'}`, 'cyan');
            resolve(response);
          } catch (error) {
            log('❌ Réponse invalide du serveur', 'red');
            log('📄 Réponse reçue: ' + responseData, 'yellow');
            reject(new Error('Réponse invalide du serveur'));
          }
        } else {
          log(`❌ Erreur serveur: ${res.statusCode}`, 'red');
          log('📄 Message d\'erreur: ' + responseData, 'yellow');
          reject(new Error(`Erreur serveur: ${res.statusCode} - ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Erreur de connexion: ${error.message}`, 'red');
      log(`🔍 Code d'erreur: ${error.code}`, 'yellow');
      
      if (error.code === 'ECONNREFUSED') {
        log('💡 Le serveur semble être inaccessible', 'yellow');
        log('🔍 Vérifiez que l\'URL est correcte:', 'yellow');
        log(`   ${SERVER_URL}`, 'cyan');
      } else if (error.code === 'ENOTFOUND') {
        log('💡 Nom de domaine introuvable', 'yellow');
        log('🔍 Vérifiez votre connexion internet', 'yellow');
      }
      
      reject(error);
    });
    
    req.on('timeout', () => {
      log('⏱️  Timeout de connexion (15s)', 'red');
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
  log(`🎯 Serveur cible: ${SERVER_URL}`, 'blue');
  log('', 'reset');
  
  try {
    // Analyser le système
    const systemData = await analyzeSystem();
    
    // Générer et logguer l'ID machine
    const machineId = generateMachineId(systemData);
    log(`🔑 Machine ID: ${machineId}`, 'cyan');
    log('', 'reset');
    
    // Envoyer au serveur
    const result = await sendToServer(systemData);
    
    log('', 'reset');
    log('🎉 Analyse terminée avec succès !', 'green');
    log('📋 Vous pouvez maintenant retourner sur le site web', 'cyan');
    log('🔗 L\'analyse sera automatiquement détectée', 'cyan');
    log('', 'reset');
    
    // Attendre 3 secondes avant de fermer
    log('⏳ Fermeture dans 3 secondes...', 'yellow');
    setTimeout(() => {
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    log('', 'reset');
    log('❌ Échec de l\'analyse', 'red');
    log('', 'reset');
    log('💡 Solutions possibles:', 'yellow');
    log('1. Vérifiez votre connexion internet', 'yellow');
    log('2. Vérifiez que le serveur est accessible:', 'yellow');
    log(`   ${SERVER_URL}`, 'cyan');
    log('3. Contactez le support si le problème persiste', 'yellow');
    log('', 'reset');
    
    // Attendre 5 secondes avant de fermer en cas d'erreur
    setTimeout(() => {
      process.exit(1);
    }, 5000);
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
  log('Exemples:', 'yellow');
  log('  node pcanalys-agent.js', 'cyan');
  log('  node pcanalys-agent.js --server https://pc-analys-production.up.railway.app', 'cyan');
  log('', 'reset');
  process.exit(0);
}

// Lancer l'agent
main();
