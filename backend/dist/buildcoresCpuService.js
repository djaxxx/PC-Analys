"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBuildcoresCpus = loadBuildcoresCpus;
exports.getCpuByName = getCpuByName;
exports.suggestCpuUpgrades = suggestCpuUpgrades;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const fuse_js_1 = __importDefault(require("fuse.js"));
let cpus = [];
let cpuFuse;
async function loadBuildcoresCpus() {
    const cpuDir = path_1.default.join(__dirname, '../data/buildcores/CPU');
    let all = [];
    try {
        const files = await promises_1.default.readdir(cpuDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path_1.default.join(cpuDir, file);
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
    cpus = all;
    cpuFuse = new fuse_js_1.default(cpus, { keys: ['metadata.name'], threshold: 0.3 });
}
function getCpuByName(name) {
    // Recherche exacte d'abord
    const exact = cpus.find(cpu => cpu.metadata?.name?.toLowerCase() === name.toLowerCase());
    if (exact)
        return exact;
    // Sinon fuzzy
    const fuzzy = cpuFuse.search(name);
    return fuzzy.length > 0 ? fuzzy[0].item : undefined;
}
function suggestCpuUpgrades(currentCpu, count = 3) {
    // Même socket, même coreFamily, specs supérieures
    const candidates = cpus.filter(cpu => cpu.socket === currentCpu.socket &&
        cpu.coreFamily === currentCpu.coreFamily &&
        cpu.metadata?.name !== currentCpu.metadata?.name &&
        ((cpu.cores?.total || 0) > (currentCpu.cores?.total || 0) ||
            (cpu.cores?.threads || 0) > (currentCpu.cores?.threads || 0) ||
            (cpu.clocks?.performance?.base || 0) > (currentCpu.clocks?.performance?.base || 0) ||
            (cpu.clocks?.performance?.boost || 0) > (currentCpu.clocks?.performance?.boost || 0)));
    // Trier par nombre de cœurs, puis threads, puis boost clock
    candidates.sort((a, b) => (b.cores?.total || 0) - (a.cores?.total || 0) ||
        (b.cores?.threads || 0) - (a.cores?.threads || 0) ||
        (b.clocks?.performance?.boost || 0) - (a.clocks?.performance?.boost || 0));
    return candidates.slice(0, count);
}
