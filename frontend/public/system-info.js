// Script pour collecter les informations système détaillées côté client
async function getDetailedSystemInfo() {
  const info = {};
  
  try {
    // CPU - Informations détaillées via WMI (Windows Management Instrumentation)
    if (typeof window !== 'undefined' && window.ActiveXObject) {
      // Internet Explorer (ancien)
      const wmi = new ActiveXObject("WbemScripting.SWbemLocator");
      const service = wmi.ConnectServer(".", "root\\cimv2");
      
      // CPU
      const cpuQuery = "SELECT * FROM Win32_Processor";
      const cpuEnum = service.ExecQuery(cpuQuery);
      const cpu = cpuEnum.ItemIndex(0);
      
      info.cpu = {
        marque: cpu.Manufacturer,
        modèle: cpu.Name,
        cœurs: cpu.NumberOfCores,
        vitesse: cpu.MaxClockSpeed + ' MHz'
      };
      
      // RAM
      const ramQuery = "SELECT * FROM Win32_PhysicalMemory";
      const ramEnum = service.ExecQuery(ramQuery);
      let totalRam = 0;
      const ramModules = [];
      
      for (let i = 0; i < ramEnum.Count; i++) {
        const ram = ramEnum.ItemIndex(i);
        totalRam += parseInt(ram.Capacity);
        ramModules.push({
          size: ram.Capacity,
          speed: ram.Speed,
          type: ram.MemoryType
        });
      }
      
      info.ram = {
        totale: (totalRam / (1024 ** 3)).toFixed(2) + ' Go',
        utilisée: 'Calculé côté serveur',
        type: ramModules[0]?.type || 'DDR4',
        formFactor: 'UDIMM',
        slots_total: ramModules.length,
        slots_libres: 0
      };
      
      // GPU
      const gpuQuery = "SELECT * FROM Win32_VideoController";
      const gpuEnum = service.ExecQuery(gpuQuery);
      const gpus = [];
      
      for (let i = 0; i < gpuEnum.Count; i++) {
        const gpu = gpuEnum.ItemIndex(i);
        gpus.push({
          marque: gpu.AdapterCompatibility,
          modèle: gpu.Name,
          vram: (gpu.AdapterRAM / (1024 ** 2)).toFixed(0) + ' Mo'
        });
      }
      
      info.gpu = gpus;
      
      // Stockage
      const diskQuery = "SELECT * FROM Win32_LogicalDisk";
      const diskEnum = service.ExecQuery(diskQuery);
      const disks = [];
      
      for (let i = 0; i < diskEnum.Count; i++) {
        const disk = diskEnum.ItemIndex(i);
        disks.push({
          type: 'SSD/HDD',
          interface: 'SATA/NVMe',
          taille: (disk.Size / (1024 ** 3)).toFixed(2) + ' Go',
          nom: disk.Caption
        });
      }
      
      info.stockage = disks;
      
    } else {
      // Fallback pour les navigateurs modernes
      info.cpu = {
        marque: 'Détecté via navigateur',
        modèle: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cœurs` : 'Non détecté',
        cœurs: navigator.hardwareConcurrency || 'Non détecté',
        vitesse: 'Non détecté côté client'
      };
      
      if ('memory' in performance) {
        const memory = performance.memory;
        info.ram = {
          totale: `${(memory.jsHeapSizeLimit / (1024 ** 3)).toFixed(2)} Go (limite navigateur)`,
          utilisée: `${(memory.usedJSHeapSize / (1024 ** 3)).toFixed(2)} Go`,
          type: 'DDR4/DDR5 (estimé)',
          formFactor: 'SODIMM/UDIMM',
          slots_total: 'Non détecté côté client',
          slots_libres: 'Non détecté côté client'
        };
      } else {
        info.ram = {
          totale: 'Non détecté côté client',
          utilisée: 'Non détecté côté client',
          type: 'Non détecté côté client',
          formFactor: 'Non détecté côté client',
          slots_total: 'Non détecté côté client',
          slots_libres: 'Non détecté côté client'
        };
      }
      
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          info.gpu = [{
            marque: 'Détecté via WebGL',
            modèle: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            vram: 'Non détecté côté client'
          }];
        } else {
          info.gpu = [{
            marque: 'Détecté via WebGL',
            modèle: gl.getParameter(gl.RENDERER),
            vram: 'Non détecté côté client'
          }];
        }
      } else {
        info.gpu = [{
          marque: 'Non détecté côté client',
          modèle: 'Non détecté côté client',
          vram: 'Non détecté côté client'
        }];
      }
      
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        info.stockage = [{
          type: 'SSD/HDD (estimé)',
          interface: 'SATA/NVMe (estimé)',
          taille: estimate.quota ? `${(estimate.quota / (1024 ** 3)).toFixed(2)} Go (quota navigateur)` : 'Non détecté côté client',
          nom: 'Stockage système'
        }];
      } else {
        info.stockage = [{
          type: 'Non détecté côté client',
          interface: 'Non détecté côté client',
          taille: 'Non détecté côté client',
          nom: 'Non détecté côté client'
        }];
      }
    }
    
    return info;
  } catch (error) {
    console.error('Erreur lors de la détection système:', error);
    // Fallback basique
    return {
      cpu: { marque: 'Erreur détection', modèle: 'Erreur détection', cœurs: 'Erreur détection', vitesse: 'Erreur détection' },
      ram: { totale: 'Erreur détection', utilisée: 'Erreur détection', type: 'Erreur détection', formFactor: 'Erreur détection', slots_total: 'Erreur détection', slots_libres: 'Erreur détection' },
      gpu: [{ marque: 'Erreur détection', modèle: 'Erreur détection', vram: 'Erreur détection' }],
      stockage: [{ type: 'Erreur détection', interface: 'Erreur détection', taille: 'Erreur détection', nom: 'Erreur détection' }]
    };
  }
}

// Exposer la fonction globalement
if (typeof window !== 'undefined') {
  window.getDetailedSystemInfo = getDetailedSystemInfo;
} 