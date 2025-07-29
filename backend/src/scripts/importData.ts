import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

console.log('CWD:', process.cwd());
console.log('MONGO_URI:', process.env.MONGO_URI);
// Charger les variables d'environnement explicitement
dotenv.config({ path: './.env' });

import { connectDB } from '../db';
import { Cpu, Gpu, Ram, Storage, Motherboard, CpuCooler } from '../models';

const DATA_DIR = path.join(__dirname, '../../data/buildcores');

interface ImportResult {
  collection: string;
  imported: number;
  errors: number;
  duration: number;
}

async function importCollection<T>(
  collectionName: string,
  model: any,
  dataDir: string
): Promise<ImportResult> {
  const startTime = Date.now();
  let imported = 0;
  let errors = 0;

  try {
    console.log(`📁 Import de ${collectionName}...`);
    
    // Vérifier si le dossier existe
    if (!(await fs.stat(dataDir).catch(() => false))) {
      console.log(`⚠️  Dossier ${dataDir} non trouvé, ignoré`);
      return { collection: collectionName, imported: 0, errors: 0, duration: Date.now() - startTime };
    }

    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`📄 ${jsonFiles.length} fichiers JSON trouvés`);

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(dataDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        // Vérifier si l'enregistrement existe déjà
        const existing = await model.findOne({ opendb_id: data.opendb_id });
        if (existing) {
          console.log(`⏭️  ${file} déjà importé, ignoré`);
          continue;
        }

        // Créer le nouvel enregistrement
        await model.create(data);
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`✅ ${imported} ${collectionName} importés...`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'import de ${file}:`, error);
        errors++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ ${collectionName}: ${imported} importés, ${errors} erreurs en ${duration}ms`);
    
    return { collection: collectionName, imported, errors, duration };
  } catch (error) {
    console.error(`❌ Erreur lors de l'import de ${collectionName}:`, error);
    return { collection: collectionName, imported, errors, duration: Date.now() - startTime };
  }
}

async function importAllData() {
  console.log('🚀 Début de l\'import des données vers MongoDB Atlas...');
  
  try {
    // Connexion à MongoDB
    await connectDB();
    console.log('✅ Connecté à MongoDB Atlas');

    const results: ImportResult[] = [];

    // Import de chaque collection
    const collections = [
      { name: 'CPU', model: Cpu, dir: path.join(DATA_DIR, 'CPU') },
      { name: 'GPU', model: Gpu, dir: path.join(DATA_DIR, 'GPU') },
      { name: 'RAM', model: Ram, dir: path.join(DATA_DIR, 'RAM') },
      { name: 'Storage', model: Storage, dir: path.join(DATA_DIR, 'Storage') },
      { name: 'Motherboard', model: Motherboard, dir: path.join(DATA_DIR, 'Motherboard') },
      { name: 'CPUCooler', model: CpuCooler, dir: path.join(DATA_DIR, 'CPUCooler') }
    ];

    for (const collection of collections) {
      const result = await importCollection(collection.name, collection.model, collection.dir);
      results.push(result);
    }

    // Résumé final
    console.log('\n📊 Résumé de l\'import:');
    console.log('='.repeat(50));
    
    let totalImported = 0;
    let totalErrors = 0;
    let totalDuration = 0;

    results.forEach(result => {
      console.log(`${result.collection.padEnd(12)}: ${result.imported.toString().padStart(5)} importés, ${result.errors.toString().padStart(3)} erreurs (${result.duration}ms)`);
      totalImported += result.imported;
      totalErrors += result.errors;
      totalDuration += result.duration;
    });

    console.log('='.repeat(50));
    console.log(`Total: ${totalImported} importés, ${totalErrors} erreurs en ${totalDuration}ms`);
    
    if (totalErrors === 0) {
      console.log('🎉 Import terminé avec succès !');
    } else {
      console.log('⚠️  Import terminé avec quelques erreurs');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

// Exécuter si ce script est lancé directement
if (require.main === module) {
  importAllData();
}

export default importAllData; 