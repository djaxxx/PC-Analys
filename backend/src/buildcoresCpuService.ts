import fs from 'fs/promises';
import path from 'path';
import Fuse from 'fuse.js';

export type CpuEntry = {
  opendb_id: string;
  metadata: { name: string; [key: string]: any };
  socket: string;
  coreFamily?: string;
  cores?: { total?: number; threads?: number };
  clocks?: { performance?: { base?: number; boost?: number } };
  specifications?: { tdp?: number; lithography?: string };
  [key: string]: any;
};

let cpus: CpuEntry[] = [];
let cpuFuse: Fuse<CpuEntry>;

export async function loadBuildcoresCpus() {
  const cpuDir = path.join(__dirname, '../data/buildcores/CPU');
  let all: CpuEntry[] = [];
  try {
    const files = await fs.readdir(cpuDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(cpuDir, file);
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
  cpus = all;
  cpuFuse = new Fuse(cpus, { keys: ['metadata.name'], threshold: 0.3 });
}

export function getCpuByName(name: string): CpuEntry | undefined {
  // Recherche exacte d'abord
  const exact = cpus.find(cpu => cpu.metadata?.name?.toLowerCase() === name.toLowerCase());
  if (exact) return exact;
  // Sinon fuzzy
  const fuzzy = cpuFuse.search(name);
  return fuzzy.length > 0 ? fuzzy[0].item : undefined;
}

export function suggestCpuUpgrades(currentCpu: CpuEntry, count = 3): CpuEntry[] {
  // Même socket, même coreFamily, specs supérieures
  const candidates = cpus.filter(cpu =>
    cpu.socket === currentCpu.socket &&
    cpu.coreFamily === currentCpu.coreFamily &&
    cpu.metadata?.name !== currentCpu.metadata?.name &&
    (
      (cpu.cores?.total || 0) > (currentCpu.cores?.total || 0) ||
      (cpu.cores?.threads || 0) > (currentCpu.cores?.threads || 0) ||
      (cpu.clocks?.performance?.base || 0) > (currentCpu.clocks?.performance?.base || 0) ||
      (cpu.clocks?.performance?.boost || 0) > (currentCpu.clocks?.performance?.boost || 0)
    )
  );
  // Trier par nombre de cœurs, puis threads, puis boost clock
  candidates.sort((a, b) =>
    (b.cores?.total || 0) - (a.cores?.total || 0) ||
    (b.cores?.threads || 0) - (a.cores?.threads || 0) ||
    (b.clocks?.performance?.boost || 0) - (a.clocks?.performance?.boost || 0)
  );
  return candidates.slice(0, count);
} 