import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();
require('dotenv').config({ path: './.env' });
console.log(process.env.MONGO_URI); 

// Charger les variables d'environnement explicitement
dotenv.config({ path: './.env' });
console.log(process.env.MONGO_URI); 

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('❌ Variable d\'environnement MONGO_URI non définie');
    console.error('💡 Vérifie que le fichier .env existe et contient MONGO_URI');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB Atlas');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

export default mongoose; 