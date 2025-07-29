import fs from 'fs/promises';
import path from 'path';
import Fuse from 'fuse.js';

export type GpuEntry = {
  opendb_id: string;
  metadata: { name: string; manufacturer?: string; variant?: string; [key: string]: any };
  bus?: string;
  chipset?: string; // Ajouté pour la logique d'upgrade
  memory?: { size?: number };
  clocks?: { base?: number; boost?: number };
  [key: string]: any;
};

let gpus: GpuEntry[] = [];
let gpuFuse: Fuse<GpuEntry>;

export async function loadBuildcoresGpus() {
  const gpuDir = path.join(__dirname, '../data/buildcores/GPU');
  let all: GpuEntry[] = [];
  try {
    const files = await fs.readdir(gpuDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(gpuDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const obj = JSON.parse(content);
          all.push(obj);
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    // ignore
  }
  gpus = all;
  gpuFuse = new Fuse(gpus, { keys: ['metadata.name'], threshold: 0.3 });
}

export function getGpuByName(name: string): GpuEntry | undefined {
  // Recherche exacte d'abord
  const exact = gpus.find(gpu => gpu.metadata?.name?.toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  // Sinon fuzzy
  const fuzzy = gpuFuse.search(name);
  return fuzzy.length > 0 ? fuzzy[0].item : undefined;
}

export function suggestGpuUpgrades(currentGpu: GpuEntry, count = 3): GpuEntry[] {
  // Même bus (PCIe), chipset supérieur (ou différent), specs supérieures
  const candidates = gpus.filter(gpu =>
    gpu.bus === currentGpu.bus &&
    gpu.metadata?.name !== currentGpu.metadata?.name &&
    (
      (gpu.chipset && currentGpu.chipset && gpu.chipset > currentGpu.chipset) ||
      (gpu.memory?.size || 0) > (currentGpu.memory?.size || 0) ||
      (gpu.clocks?.base || 0) > (currentGpu.clocks?.base || 0) ||
      (gpu.clocks?.boost || 0) > (currentGpu.clocks?.boost || 0)
    )
  );
  // Trier par chipset (si dispo), puis VRAM, puis boost clock
  candidates.sort((a, b) =>
    ((b.chipset || '').localeCompare(a.chipset || '')) ||
    (b.memory?.size || 0) - (a.memory?.size || 0) ||
    (b.clocks?.boost || 0) - (a.clocks?.boost || 0)
  );
  return candidates.slice(0, count);
} 