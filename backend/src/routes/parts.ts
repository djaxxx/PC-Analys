import { Router } from 'express';
import { 
  cpuService, 
  gpuService, 
  ramService, 
  storageService, 
  motherboardService, 
  cpuCoolerService 
} from '../services/partsService';

const router = Router();

// Routes pour les CPUs
router.get('/cpus', async (req, res) => {
  try {
    const cpus = await cpuService.getAll();
    res.json({ success: true, data: cpus, count: cpus.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des CPUs:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/cpus/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Paramètre "name" requis' });
    }
    
    const cpu = await cpuService.getByName(name);
    res.json({ success: true, data: cpu });
  } catch (error) {
    console.error('Erreur lors de la recherche de CPU:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/cpus/socket/:socket', async (req, res) => {
  try {
    const { socket } = req.params;
    const cpus = await cpuService.getBySocket(socket);
    res.json({ success: true, data: cpus, count: cpus.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des CPUs par socket:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Routes pour les GPUs
router.get('/gpus', async (req, res) => {
  try {
    const gpus = await gpuService.getAll();
    res.json({ success: true, data: gpus, count: gpus.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des GPUs:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/gpus/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Paramètre "name" requis' });
    }
    
    const gpu = await gpuService.getByName(name);
    res.json({ success: true, data: gpu });
  } catch (error) {
    console.error('Erreur lors de la recherche de GPU:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/gpus/manufacturer/:manufacturer', async (req, res) => {
  try {
    const { manufacturer } = req.params;
    const gpus = await gpuService.getByManufacturer(manufacturer);
    res.json({ success: true, data: gpus, count: gpus.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des GPUs par fabricant:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Routes pour les RAMs
router.get('/rams', async (req, res) => {
  try {
    const rams = await ramService.getAll();
    res.json({ success: true, data: rams, count: rams.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des RAMs:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/rams/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Paramètre "name" requis' });
    }
    
    const ram = await ramService.getByName(name);
    res.json({ success: true, data: ram });
  } catch (error) {
    console.error('Erreur lors de la recherche de RAM:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/rams/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const rams = await ramService.getByType(type);
    res.json({ success: true, data: rams, count: rams.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des RAMs par type:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Routes pour les Storages
router.get('/storages', async (req, res) => {
  try {
    const storages = await storageService.getAll();
    res.json({ success: true, data: storages, count: storages.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des Storages:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/storages/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Paramètre "name" requis' });
    }
    
    const storage = await storageService.getByName(name);
    res.json({ success: true, data: storage });
  } catch (error) {
    console.error('Erreur lors de la recherche de Storage:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/storages/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const storages = await storageService.getByType(type);
    res.json({ success: true, data: storages, count: storages.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des Storages par type:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Routes pour les Motherboards
router.get('/motherboards', async (req, res) => {
  try {
    const motherboards = await motherboardService.getAll();
    res.json({ success: true, data: motherboards, count: motherboards.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des Motherboards:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/motherboards/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Paramètre "name" requis' });
    }
    
    const motherboard = await motherboardService.getByName(name);
    res.json({ success: true, data: motherboard });
  } catch (error) {
    console.error('Erreur lors de la recherche de Motherboard:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/motherboards/socket/:socket', async (req, res) => {
  try {
    const { socket } = req.params;
    const motherboards = await motherboardService.getBySocket(socket);
    res.json({ success: true, data: motherboards, count: motherboards.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des Motherboards par socket:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Routes pour les CPU Coolers
router.get('/cpu-coolers', async (req, res) => {
  try {
    const cpuCoolers = await cpuCoolerService.getAll();
    res.json({ success: true, data: cpuCoolers, count: cpuCoolers.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des CPU Coolers:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/cpu-coolers/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Paramètre "name" requis' });
    }
    
    const cpuCooler = await cpuCoolerService.getByName(name);
    res.json({ success: true, data: cpuCooler });
  } catch (error) {
    console.error('Erreur lors de la recherche de CPU Cooler:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

router.get('/cpu-coolers/socket/:socket', async (req, res) => {
  try {
    const { socket } = req.params;
    const cpuCoolers = await cpuCoolerService.getBySocket(socket);
    res.json({ success: true, data: cpuCoolers, count: cpuCoolers.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des CPU Coolers par socket:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour obtenir des statistiques
router.get('/stats', async (req, res) => {
  try {
    const [cpus, gpus, rams, storages, motherboards, cpuCoolers] = await Promise.all([
      cpuService.getAll(),
      gpuService.getAll(),
      ramService.getAll(),
      storageService.getAll(),
      motherboardService.getAll(),
      cpuCoolerService.getAll()
    ]);

    res.json({
      success: true,
      data: {
        cpus: cpus.length,
        gpus: gpus.length,
        rams: rams.length,
        storages: storages.length,
        motherboards: motherboards.length,
        cpuCoolers: cpuCoolers.length,
        total: cpus.length + gpus.length + rams.length + storages.length + motherboards.length + cpuCoolers.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

export default router; 