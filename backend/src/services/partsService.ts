import { Cpu, Gpu, Ram, Storage, Motherboard, CpuCooler } from '../models';
import type { ICpu, IGpu, IRam, IStorage, IMotherboard, ICpuCooler } from '../models';

// Cache en mémoire pour optimiser les performances
interface Cache {
  cpus: ICpu[] | null;
  gpus: IGpu[] | null;
  rams: IRam[] | null;
  storages: IStorage[] | null;
  motherboards: IMotherboard[] | null;
  cpuCoolers: ICpuCooler[] | null;
  lastUpdate: { [key: string]: number };
}

const cache: Cache = {
  cpus: null,
  gpus: null,
  rams: null,
  storages: null,
  motherboards: null,
  cpuCoolers: null,
  lastUpdate: {}
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fonction utilitaire pour vérifier si le cache est valide
function isCacheValid(component: keyof Omit<Cache, 'lastUpdate'>): boolean {
  const lastUpdate = cache.lastUpdate[component];
  return typeof lastUpdate === 'number' && (Date.now() - lastUpdate) < CACHE_DURATION;
}

// Fonction utilitaire pour mettre à jour le cache
function updateCache<T>(component: keyof Omit<Cache, 'lastUpdate'>, data: T[]) {
  cache[component] = data as any;
  cache.lastUpdate[component] = Date.now();
}

// Service pour les CPUs
export const cpuService = {
  async getAll(): Promise<ICpu[]> {
    if (!isCacheValid('cpus')) {
      const cpus = await Cpu.find().lean();
      updateCache('cpus', cpus);
    }
    return cache.cpus || [];
  },

  async getByName(name: string): Promise<ICpu | null> {
    const cpus = await this.getAll();
    return cpus.find(cpu => 
      cpu.metadata?.name?.toLowerCase().includes(name.toLowerCase())
    ) || null;
  },

  async getBySocket(socket: string): Promise<ICpu[]> {
    const cpus = await this.getAll();
    return cpus.filter(cpu => cpu.socket === socket);
  },

  async suggestUpgrades(currentCpu: ICpu, count = 3): Promise<ICpu[]> {
    const cpus = await this.getAll();
    const candidates = cpus.filter(cpu =>
      cpu.socket === currentCpu.socket &&
      cpu.coreFamily === currentCpu.coreFamily &&
      cpu.metadata?.name !== currentCpu.metadata?.name &&
      (
        (cpu.cores?.total || 0) > (currentCpu.cores?.total || 0) ||
        (cpu.cores?.threads || 0) > (currentCpu.cores?.threads || 0) ||
        (cpu.clocks?.performance?.base || 0) > (currentCpu.clocks?.performance?.base || 0)
      )
    );

    candidates.sort((a, b) =>
      (b.cores?.total || 0) - (a.cores?.total || 0) ||
      (b.cores?.threads || 0) - (a.cores?.threads || 0) ||
      (b.clocks?.performance?.boost || 0) - (a.clocks?.performance?.boost || 0)
    );

    return candidates.slice(0, count);
  }
};

// Service pour les GPUs
export const gpuService = {
  async getAll(): Promise<IGpu[]> {
    if (!isCacheValid('gpus')) {
      const gpus = await Gpu.find().lean();
      updateCache('gpus', gpus);
    }
    return cache.gpus || [];
  },

  async getByName(name: string): Promise<IGpu | null> {
    const gpus = await this.getAll();
    return gpus.find(gpu => 
      gpu.metadata?.name?.toLowerCase().includes(name.toLowerCase())
    ) || null;
  },

  async getByManufacturer(manufacturer: string): Promise<IGpu[]> {
    const gpus = await this.getAll();
    return gpus.filter(gpu => gpu.manufacturer === manufacturer);
  }
};

// Service pour les RAMs
export const ramService = {
  async getAll(): Promise<IRam[]> {
    if (!isCacheValid('rams')) {
      const rams = await Ram.find().lean();
      updateCache('rams', rams);
    }
    return cache.rams || [];
  },

  async getByName(name: string): Promise<IRam | null> {
    const rams = await this.getAll();
    return rams.find(ram => 
      ram.metadata?.name?.toLowerCase().includes(name.toLowerCase())
    ) || null;
  },

  async getByType(type: string): Promise<IRam[]> {
    const rams = await this.getAll();
    return rams.filter(ram => ram.memory?.type === type);
  }
};

// Service pour les Storages
export const storageService = {
  async getAll(): Promise<IStorage[]> {
    if (!isCacheValid('storages')) {
      const storages = await Storage.find().lean();
      updateCache('storages', storages);
    }
    return cache.storages || [];
  },

  async getByName(name: string): Promise<IStorage | null> {
    const storages = await this.getAll();
    return storages.find(storage => 
      storage.metadata?.name?.toLowerCase().includes(name.toLowerCase())
    ) || null;
  },

  async getByType(type: string): Promise<IStorage[]> {
    const storages = await this.getAll();
    return storages.filter(storage => storage.storage?.type === type);
  }
};

// Service pour les Motherboards
export const motherboardService = {
  async getAll(): Promise<IMotherboard[]> {
    if (!isCacheValid('motherboards')) {
      const motherboards = await Motherboard.find().lean();
      updateCache('motherboards', motherboards);
    }
    return cache.motherboards || [];
  },

  async getByName(name: string): Promise<IMotherboard | null> {
    const motherboards = await this.getAll();
    return motherboards.find(motherboard => 
      motherboard.metadata?.name?.toLowerCase().includes(name.toLowerCase())
    ) || null;
  },

  async getBySocket(socket: string): Promise<IMotherboard[]> {
    const motherboards = await this.getAll();
    return motherboards.filter(motherboard => motherboard.socket === socket);
  }
};

// Service pour les CPU Coolers
export const cpuCoolerService = {
  async getAll(): Promise<ICpuCooler[]> {
    if (!isCacheValid('cpuCoolers')) {
      const cpuCoolers = await CpuCooler.find().lean();
      updateCache('cpuCoolers', cpuCoolers);
    }
    return cache.cpuCoolers || [];
  },

  async getByName(name: string): Promise<ICpuCooler | null> {
    const cpuCoolers = await this.getAll();
    return cpuCoolers.find(cooler => 
      cooler.metadata?.name?.toLowerCase().includes(name.toLowerCase())
    ) || null;
  },

  async getBySocket(socket: string): Promise<ICpuCooler[]> {
    const cpuCoolers = await this.getAll();
    return cpuCoolers.filter(cooler => 
      cooler.socket?.includes(socket)
    );
  }
};

// Fonction pour vider le cache (utile pour les tests ou les mises à jour)
export function clearCache(component?: keyof Omit<Cache, 'lastUpdate'>) {
  if (component) {
    cache[component] = null;
    delete cache.lastUpdate[component];
  } else {
    Object.keys(cache).forEach(key => {
      if (key !== 'lastUpdate') {
        cache[key as keyof Omit<Cache, 'lastUpdate'>] = null;
      }
    });
    cache.lastUpdate = {};
  }
} 