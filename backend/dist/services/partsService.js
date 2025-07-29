"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cpuCoolerService = exports.motherboardService = exports.storageService = exports.ramService = exports.gpuService = exports.cpuService = void 0;
exports.clearCache = clearCache;
const models_1 = require("../models");
const cache = {
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
function isCacheValid(component) {
    const lastUpdate = cache.lastUpdate[component];
    return typeof lastUpdate === 'number' && (Date.now() - lastUpdate) < CACHE_DURATION;
}
// Fonction utilitaire pour mettre à jour le cache
function updateCache(component, data) {
    cache[component] = data;
    cache.lastUpdate[component] = Date.now();
}
// Service pour les CPUs
exports.cpuService = {
    async getAll() {
        if (!isCacheValid('cpus')) {
            const cpus = await models_1.Cpu.find().lean();
            updateCache('cpus', cpus);
        }
        return cache.cpus || [];
    },
    async getByName(name) {
        const cpus = await this.getAll();
        return cpus.find(cpu => cpu.metadata?.name?.toLowerCase().includes(name.toLowerCase())) || null;
    },
    async getBySocket(socket) {
        const cpus = await this.getAll();
        return cpus.filter(cpu => cpu.socket === socket);
    },
    async suggestUpgrades(currentCpu, count = 3) {
        const cpus = await this.getAll();
        const candidates = cpus.filter(cpu => cpu.socket === currentCpu.socket &&
            cpu.coreFamily === currentCpu.coreFamily &&
            cpu.metadata?.name !== currentCpu.metadata?.name &&
            ((cpu.cores?.total || 0) > (currentCpu.cores?.total || 0) ||
                (cpu.cores?.threads || 0) > (currentCpu.cores?.threads || 0) ||
                (cpu.clocks?.performance?.base || 0) > (currentCpu.clocks?.performance?.base || 0)));
        candidates.sort((a, b) => (b.cores?.total || 0) - (a.cores?.total || 0) ||
            (b.cores?.threads || 0) - (a.cores?.threads || 0) ||
            (b.clocks?.performance?.boost || 0) - (a.clocks?.performance?.boost || 0));
        return candidates.slice(0, count);
    }
};
// Service pour les GPUs
exports.gpuService = {
    async getAll() {
        if (!isCacheValid('gpus')) {
            const gpus = await models_1.Gpu.find().lean();
            updateCache('gpus', gpus);
        }
        return cache.gpus || [];
    },
    async getByName(name) {
        const gpus = await this.getAll();
        return gpus.find(gpu => gpu.metadata?.name?.toLowerCase().includes(name.toLowerCase())) || null;
    },
    async getByManufacturer(manufacturer) {
        const gpus = await this.getAll();
        return gpus.filter(gpu => gpu.manufacturer === manufacturer);
    }
};
// Service pour les RAMs
exports.ramService = {
    async getAll() {
        if (!isCacheValid('rams')) {
            const rams = await models_1.Ram.find().lean();
            updateCache('rams', rams);
        }
        return cache.rams || [];
    },
    async getByName(name) {
        const rams = await this.getAll();
        return rams.find(ram => ram.metadata?.name?.toLowerCase().includes(name.toLowerCase())) || null;
    },
    async getByType(type) {
        const rams = await this.getAll();
        return rams.filter(ram => ram.memory?.type === type);
    }
};
// Service pour les Storages
exports.storageService = {
    async getAll() {
        if (!isCacheValid('storages')) {
            const storages = await models_1.Storage.find().lean();
            updateCache('storages', storages);
        }
        return cache.storages || [];
    },
    async getByName(name) {
        const storages = await this.getAll();
        return storages.find(storage => storage.metadata?.name?.toLowerCase().includes(name.toLowerCase())) || null;
    },
    async getByType(type) {
        const storages = await this.getAll();
        return storages.filter(storage => storage.storage?.type === type);
    }
};
// Service pour les Motherboards
exports.motherboardService = {
    async getAll() {
        if (!isCacheValid('motherboards')) {
            const motherboards = await models_1.Motherboard.find().lean();
            updateCache('motherboards', motherboards);
        }
        return cache.motherboards || [];
    },
    async getByName(name) {
        const motherboards = await this.getAll();
        return motherboards.find(motherboard => motherboard.metadata?.name?.toLowerCase().includes(name.toLowerCase())) || null;
    },
    async getBySocket(socket) {
        const motherboards = await this.getAll();
        return motherboards.filter(motherboard => motherboard.socket === socket);
    }
};
// Service pour les CPU Coolers
exports.cpuCoolerService = {
    async getAll() {
        if (!isCacheValid('cpuCoolers')) {
            const cpuCoolers = await models_1.CpuCooler.find().lean();
            updateCache('cpuCoolers', cpuCoolers);
        }
        return cache.cpuCoolers || [];
    },
    async getByName(name) {
        const cpuCoolers = await this.getAll();
        return cpuCoolers.find(cooler => cooler.metadata?.name?.toLowerCase().includes(name.toLowerCase())) || null;
    },
    async getBySocket(socket) {
        const cpuCoolers = await this.getAll();
        return cpuCoolers.filter(cooler => cooler.socket?.includes(socket));
    }
};
// Fonction pour vider le cache (utile pour les tests ou les mises à jour)
function clearCache(component) {
    if (component) {
        cache[component] = null;
        delete cache.lastUpdate[component];
    }
    else {
        Object.keys(cache).forEach(key => {
            if (key !== 'lastUpdate') {
                cache[key] = null;
            }
        });
        cache.lastUpdate = {};
    }
}
