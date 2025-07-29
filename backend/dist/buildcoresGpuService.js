"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBuildcoresGpus = loadBuildcoresGpus;
exports.getGpuByName = getGpuByName;
exports.suggestGpuUpgrades = suggestGpuUpgrades;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const fuse_js_1 = __importDefault(require("fuse.js"));
let gpus = [];
let gpuFuse;
async function loadBuildcoresGpus() {
    const gpuDir = path_1.default.join(__dirname, '../data/buildcores/GPU');
    let all = [];
    try {
        const files = await promises_1.default.readdir(gpuDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path_1.default.join(gpuDir, file);
                try {
                    const content = await promises_1.default.readFile(filePath, 'utf-8');
                    const obj = JSON.parse(content);
                    all.push(obj);
                }
                catch (e) {
                    // ignore
                }
            }
        }
    }
    catch (e) {
        // ignore
    }
    gpus = all;
    gpuFuse = new fuse_js_1.default(gpus, { keys: ['metadata.name'], threshold: 0.3 });
}
function getGpuByName(name) {
    // Recherche exacte d'abord
    const exact = gpus.find(gpu => gpu.metadata?.name?.toLowerCase() === name.toLowerCase());
    if (exact)
        return exact;
    // Sinon fuzzy
    const fuzzy = gpuFuse.search(name);
    return fuzzy.length > 0 ? fuzzy[0].item : undefined;
}
function suggestGpuUpgrades(currentGpu, count = 3) {
    // Même bus (PCIe), chipset supérieur (ou différent), specs supérieures
    const candidates = gpus.filter(gpu => gpu.bus === currentGpu.bus &&
        gpu.metadata?.name !== currentGpu.metadata?.name &&
        ((gpu.chipset && currentGpu.chipset && gpu.chipset > currentGpu.chipset) ||
            (gpu.memory?.size || 0) > (currentGpu.memory?.size || 0) ||
            (gpu.clocks?.base || 0) > (currentGpu.clocks?.base || 0) ||
            (gpu.clocks?.boost || 0) > (currentGpu.clocks?.boost || 0)));
    // Trier par chipset (si dispo), puis VRAM, puis boost clock
    candidates.sort((a, b) => ((b.chipset || '').localeCompare(a.chipset || '')) ||
        (b.memory?.size || 0) - (a.memory?.size || 0) ||
        (b.clocks?.boost || 0) - (a.clocks?.boost || 0));
    return candidates.slice(0, count);
}
