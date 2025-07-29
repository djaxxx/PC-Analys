import fs from 'fs/promises';
import path from 'path';

const PARTS = [
  'cpu',
  'motherboard',
  'memory',
  'video-card',
  'internal-hard-drive',
  'power-supply',
  'case',
  'cpu-cooler',
  'external-hard-drive',
  'monitor',
  'optical-drive',
  'os',
  'sound-card',
  'case-fan',
  'fan-controller',
  'thermal-paste',
  'ups',
  'headphones',
  'keyboard',
  'mouse',
  'speakers',
  'webcam',
];

const PARTS_DIR_MAP: Record<string, string> = {
  'cpu': 'CPU',
  'motherboard': 'Motherboard',
  'memory': 'RAM',
  'video-card': 'GPU',
  'internal-hard-drive': 'Storage',
  // ... autres si besoin
};

const DATA_DIR = path.join(__dirname, '../data/buildcores');

export type PartsData = Record<string, any[]>;

export async function loadAllParts(): Promise<PartsData> {
  const allParts: PartsData = {};
  for (const part of PARTS) {
    const dirName = PARTS_DIR_MAP[part] || part.replace(/-/g, '');
    const dirPath = path.join(DATA_DIR, dirName);
    try {
      const files = await fs.readdir(dirPath);
      const items = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
          items.push(JSON.parse(content));
        }
      }
      allParts[part] = items;
      console.log(`[DEBUG LOAD] ${part}: ${items.length} éléments chargés`);
    } catch (e) {
      allParts[part] = [];
      console.log(`[DEBUG LOAD] ${part}: 0 élément (erreur ou dossier manquant)`);
    }
  }
  return allParts;
} 