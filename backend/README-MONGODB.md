# Migration vers MongoDB Atlas

Ce guide explique comment migrer ta solution PcAnalys vers MongoDB Atlas pour une gestion de données plus robuste et scalable.

## 🚀 Étapes de migration

### 1. Configuration MongoDB Atlas

1. **Crée un compte MongoDB Atlas** (gratuit)
   - Va sur [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database)
   - Inscris-toi et crée un cluster gratuit M0

2. **Configure ta base de données**
   - Crée une base de données nommée `pcanalys`
   - Crée les collections : `cpus`, `gpus`, `rams`, `storages`, `motherboards`, `cpucoolers`

3. **Configure l'accès réseau**
   - Va dans "Network Access" > "Add IP Address"
   - Pour le développement : "Allow Access from Anywhere" (0.0.0.0/0)
   - Pour la production : limite à ton IP ou hébergeur

### 2. Configuration locale

1. **Installe les dépendances**
   ```bash
   cd backend
   npm install
   ```

2. **Configure les variables d'environnement**
   ```bash
   # Copie le fichier d'exemple
   cp env.example .env
   
   # Édite .env avec tes vraies valeurs
   # Remplace <db_password> par ton mot de passe MongoDB
   ```

### 3. Import des données

1. **Lance l'import des données JSON vers MongoDB**
   ```bash
   npm run import-data
   ```

   Ce script va :
   - Se connecter à MongoDB Atlas
   - Lire tous les fichiers JSON de `data/buildcores/`
   - Les importer dans les collections correspondantes
   - Afficher un résumé de l'import

### 4. Test de la migration

1. **Démarre le serveur**
   ```bash
   npm run dev
   ```

2. **Teste les nouvelles routes API**
   ```bash
   # Liste tous les CPUs
   GET http://localhost:4000/api/parts/cpus
   
   # Recherche un CPU par nom
   GET http://localhost:4000/api/parts/cpus/search?name=Intel
   
   # Statistiques
   GET http://localhost:4000/api/parts/stats
   ```

## 📊 Avantages de MongoDB Atlas

### ✅ Avantages
- **Données toujours disponibles** : pas de perte en cas de redémarrage
- **Scalabilité** : peut gérer des millions d'enregistrements
- **Performance** : cache en mémoire + index optimisés
- **Sécurité** : authentification, chiffrement, sauvegardes automatiques
- **Monitoring** : métriques et alertes intégrées
- **Gratuit** : offre gratuite suffisante pour commencer

### 🔧 Fonctionnalités ajoutées
- **Cache intelligent** : les données sont mises en cache 10 minutes
- **Recherche optimisée** : index sur les champs importants
- **API REST complète** : routes pour tous les types de composants
- **Gestion d'erreurs** : réponses d'erreur standardisées
- **Statistiques** : comptage automatique des composants

## 🛠️ Structure des données

### Modèles Mongoose créés
- `Cpu` : Processeurs avec socket, cores, fréquence, etc.
- `Gpu` : Cartes graphiques avec mémoire, fabricant, etc.
- `Ram` : Mémoire RAM avec type, vitesse, capacité, etc.
- `Storage` : Stockage avec type, interface, vitesse, etc.
- `Motherboard` : Cartes mères avec socket, chipset, format, etc.
- `CpuCooler` : Refroidisseurs CPU avec type, compatibilité, etc.

### Index créés pour optimiser les performances
- Recherche textuelle sur les noms
- Index sur les sockets, fabricants, types
- Index sur les caractéristiques techniques

## 🔄 Mise à jour des données

### Pour ajouter de nouveaux composants
1. Ajoute les fichiers JSON dans `data/buildcores/`
2. Relance l'import : `npm run import-data`
3. Le script détecte automatiquement les nouveaux fichiers

### Pour vider le cache (si besoin)
```typescript
import { clearCache } from './src/services/partsService';

// Vider tout le cache
clearCache();

// Vider le cache d'un composant spécifique
clearCache('cpus');
```

## 🚀 Déploiement

### Variables d'environnement pour la production
```env
PORT=4000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/pcanalys?retryWrites=true&w=majority
```

### Hébergeurs compatibles
- **Vercel** : Déploiement automatique depuis GitHub
- **Heroku** : Support Node.js natif
- **Railway** : Déploiement simple
- **AWS, Google Cloud, Azure** : VPS ou services managés

## 📈 Monitoring et maintenance

### Métriques à surveiller
- Temps de réponse des API
- Utilisation de la mémoire (cache)
- Nombre de requêtes MongoDB
- Espace disque utilisé

### Sauvegardes
- MongoDB Atlas fait des sauvegardes automatiques
- Tu peux aussi exporter manuellement les données via l'interface Atlas

## 🔧 Dépannage

### Erreurs courantes
1. **Connexion MongoDB échoue**
   - Vérifie l'URI de connexion dans `.env`
   - Vérifie que l'IP est autorisée dans Network Access

2. **Import échoue**
   - Vérifie que les fichiers JSON sont valides
   - Vérifie les permissions sur le dossier `data/`

3. **Performance lente**
   - Vérifie que les index sont créés
   - Surveille l'utilisation du cache

### Logs utiles
```bash
# Logs de connexion MongoDB
✅ Connecté à MongoDB Atlas

# Logs d'import
📁 Import de CPU...
📄 1234 fichiers JSON trouvés
✅ CPU: 1234 importés, 0 erreurs en 5000ms

# Logs de cache
Cache CPU mis à jour (1234 éléments)
```

## 🎯 Prochaines étapes

1. **Teste toutes les fonctionnalités** avec les nouvelles routes
2. **Adapte le frontend** pour utiliser les nouvelles API si nécessaire
3. **Configure le monitoring** pour surveiller les performances
4. **Planifie les sauvegardes** et la maintenance

---

**Félicitations !** 🎉 Ta solution est maintenant prête pour un déploiement professionnel avec MongoDB Atlas ! 