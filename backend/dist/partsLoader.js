"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAllParts = loadAllParts;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
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
const PARTS_DIR_MAP = {
    'cpu': 'CPU',
    'motherboard': 'Motherboard',
    'memory': 'RAM',
    'video-card': 'GPU',
    'internal-hard-drive': 'Storage',
    // ... autres si besoin
};
const DATA_DIR = path_1.default.join(__dirname, '../data/buildcores');
async function loadAllParts() {
    const allParts = {};
    for (const part of PARTS) {
        const dirName = PARTS_DIR_MAP[part] || part.replace(/-/g, '');
        const dirPath = path_1.default.join(DATA_DIR, dirName);
        try {
            const files = await promises_1.default.readdir(dirPath);
            const items = [];
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await promises_1.default.readFile(path_1.default.join(dirPath, file), 'utf-8');
                    items.push(JSON.parse(content));
                }
            }
            allParts[part] = items;
            console.log(`[DEBUG LOAD] ${part}: ${items.length} éléments chargés`);
        }
        catch (e) {
            allParts[part] = [];
            console.log(`[DEBUG LOAD] ${part}: 0 élément (erreur ou dossier manquant)`);
        }
    }
    return allParts;
}
