const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 Test de connexion MongoDB...');
console.log('URI (masqué):', MONGO_URI ? MONGO_URI.replace(/\/\/.*@/, '//***:***@') : 'Non défini');

async function testConnection() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connexion réussie !');
    
    // Test simple : lister les bases de données
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('📊 Bases de données disponibles:', dbs.databases.map(db => db.name));
    
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Solutions possibles :');
      console.log('1. Vérifie que le mot de passe dans .env est correct');
      console.log('2. Vérifie que l\'utilisateur "JACK" existe dans MongoDB Atlas');
      console.log('3. Vérifie les permissions de l\'utilisateur');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Solutions possibles :');
      console.log('1. Vérifie que l\'URI de connexion est correct');
      console.log('2. Vérifie ta connexion internet');
    }
  }
}

testConnection(); 