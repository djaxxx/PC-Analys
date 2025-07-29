"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const promises_1 = __importDefault(require("fs/promises"));
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
    'wired-network-adapter',
    'wireless-network-adapter',
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
const BASE_URL = 'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json/';
const DATA_DIR = './data';
async function downloadAllParts() {
    await promises_1.default.mkdir(DATA_DIR, { recursive: true });
    for (const part of PARTS) {
        const url = `${BASE_URL}${part}.json`;
        const localPath = `${DATA_DIR}/${part}.json`;
        try {
            const response = await axios_1.default.get(url);
            await promises_1.default.writeFile(localPath, JSON.stringify(response.data));
            console.log(`[OK] ${part}.json téléchargé.`);
        }
        catch (e) {
            console.error(`[ERREUR] Impossible de télécharger ${part}.json :`, e.message);
        }
    }
}
// Exécuter si ce fichier est lancé directement
if (require.main === module) {
    downloadAllParts();
}
exports.default = downloadAllParts;
