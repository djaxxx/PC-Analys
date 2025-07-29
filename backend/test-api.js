const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Test des API MongoDB Atlas...\n');

  try {
    // Test 1: Statistiques
    console.log('📊 Test 1: Statistiques');
    const statsResponse = await axios.get(`${BASE_URL}/api/parts/stats`);
    console.log('✅ Statistiques:', statsResponse.data);
    console.log('');

    // Test 2: Liste des CPUs
    console.log('🖥️  Test 2: Liste des CPUs');
    const cpusResponse = await axios.get(`${BASE_URL}/api/parts/cpus`);
    console.log(`✅ CPUs trouvés: ${cpusResponse.data.count}`);
    if (cpusResponse.data.data.length > 0) {
      console.log(`   Premier CPU: ${cpusResponse.data.data[0].metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 3: Recherche CPU
    console.log('🔍 Test 3: Recherche CPU');
    const searchResponse = await axios.get(`${BASE_URL}/api/parts/cpus/search?name=Intel`);
    console.log('✅ Recherche CPU:', searchResponse.data.success ? 'Succès' : 'Échec');
    if (searchResponse.data.data) {
      console.log(`   CPU trouvé: ${searchResponse.data.data.metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 4: Liste des GPUs
    console.log('🎮 Test 4: Liste des GPUs');
    const gpusResponse = await axios.get(`${BASE_URL}/api/parts/gpus`);
    console.log(`✅ GPUs trouvés: ${gpusResponse.data.count}`);
    if (gpusResponse.data.data.length > 0) {
      console.log(`   Premier GPU: ${gpusResponse.data.data[0].metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 5: Liste des RAMs
    console.log('💾 Test 5: Liste des RAMs');
    const ramsResponse = await axios.get(`${BASE_URL}/api/parts/rams`);
    console.log(`✅ RAMs trouvées: ${ramsResponse.data.count}`);
    if (ramsResponse.data.data.length > 0) {
      console.log(`   Première RAM: ${ramsResponse.data.data[0].metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 6: Liste des Storages
    console.log('💿 Test 6: Liste des Storages');
    const storagesResponse = await axios.get(`${BASE_URL}/api/parts/storages`);
    console.log(`✅ Storages trouvés: ${storagesResponse.data.count}`);
    if (storagesResponse.data.data.length > 0) {
      console.log(`   Premier Storage: ${storagesResponse.data.data[0].metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 7: Liste des Motherboards
    console.log('🔌 Test 7: Liste des Motherboards');
    const motherboardsResponse = await axios.get(`${BASE_URL}/api/parts/motherboards`);
    console.log(`✅ Motherboards trouvées: ${motherboardsResponse.data.count}`);
    if (motherboardsResponse.data.data.length > 0) {
      console.log(`   Première Motherboard: ${motherboardsResponse.data.data[0].metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 8: Liste des CPU Coolers
    console.log('❄️  Test 8: Liste des CPU Coolers');
    const coolersResponse = await axios.get(`${BASE_URL}/api/parts/cpu-coolers`);
    console.log(`✅ CPU Coolers trouvés: ${coolersResponse.data.count}`);
    if (coolersResponse.data.data.length > 0) {
      console.log(`   Premier Cooler: ${coolersResponse.data.data[0].metadata?.name || 'N/A'}`);
    }
    console.log('');

    // Test 9: Recherche par socket (CPUs)
    console.log('🔧 Test 9: Recherche CPUs par socket');
    const socketResponse = await axios.get(`${BASE_URL}/api/parts/cpus/socket/LGA1700`);
    console.log(`✅ CPUs LGA1700 trouvés: ${socketResponse.data.count}`);
    console.log('');

    // Test 10: Recherche par fabricant (GPUs)
    console.log('🏭 Test 10: Recherche GPUs par fabricant');
    const manufacturerResponse = await axios.get(`${BASE_URL}/api/parts/gpus/manufacturer/NVIDIA`);
    console.log(`✅ GPUs NVIDIA trouvées: ${manufacturerResponse.data.count}`);
    console.log('');

    console.log('🎉 Tous les tests sont terminés avec succès !');
    console.log('✅ La migration vers MongoDB Atlas est opérationnelle !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Vérifier que le serveur est démarré
console.log('⚠️  Assure-toi que le serveur backend est démarré (npm run dev)');
console.log('   Puis lance ce test dans un autre terminal\n');

testAPI(); 