# Guide de Déploiement - PcAnalys avec MongoDB Atlas

Ce guide explique comment déployer ta solution PcAnalys avec MongoDB Atlas sur différents hébergeurs.

## 🚀 **Prérequis**

- ✅ Migration MongoDB Atlas terminée
- ✅ Données importées avec succès
- ✅ Tests locaux validés
- ✅ Variables d'environnement configurées

## 📋 **Configuration des Variables d'Environnement**

### Variables requises pour la production :

```env
# Configuration du serveur
PORT=4000

# Configuration MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pcanalys?retryWrites=true&w=majority

# Variables optionnelles
NODE_ENV=production
```

## 🌐 **Options de Déploiement**

### 1. **Vercel (Recommandé pour le frontend)**

**Avantages :**
- Déploiement automatique depuis GitHub
- CDN global
- SSL gratuit
- Intégration Next.js parfaite

**Étapes :**
1. Connecte ton repo GitHub à Vercel
2. Configure les variables d'environnement dans Vercel
3. Déploie automatiquement

### 2. **Railway (Recommandé pour le backend)**

**Avantages :**
- Déploiement simple
- Base de données PostgreSQL incluse
- SSL automatique
- Monitoring intégré

**Étapes :**
1. Va sur [railway.app](https://railway.app)
2. Connecte ton repo GitHub
3. Configure les variables d'environnement
4. Déploie

### 3. **Heroku**

**Avantages :**
- Très populaire
- Documentation riche
- Add-ons nombreux

**Étapes :**
1. Crée un compte Heroku
2. Installe Heroku CLI
3. Crée une app : `heroku create pcanalys-backend`
4. Configure les variables : `heroku config:set MONGO_URI=...`
5. Déploie : `git push heroku main`

### 4. **DigitalOcean App Platform**

**Avantages :**
- Simple à utiliser
- Scalable
- Bon rapport qualité/prix

**Étapes :**
1. Crée un compte DigitalOcean
2. Va dans "Apps" > "Create App"
3. Connecte ton repo GitHub
4. Configure les variables d'environnement
5. Déploie

## 🔧 **Configuration Spécifique par Hébergeur**

### Vercel (Frontend)

1. **Crée un fichier `vercel.json` dans le dossier frontend :**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://ton-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Configure les variables d'environnement dans Vercel :**
   - Va dans ton projet Vercel
   - Settings > Environment Variables
   - Ajoute `REACT_APP_API_URL=https://ton-backend-url.com`

### Railway (Backend)

1. **Crée un fichier `railway.json` :**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/parts/stats",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

2. **Configure les variables d'environnement dans Railway**

### Heroku

1. **Crée un fichier `Procfile` :**
```
web: npm start
```

2. **Configure les variables :**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=mongodb+srv://...
```

## 🔒 **Sécurité en Production**

### 1. **Variables d'Environnement**
- ✅ Ne jamais commiter les vraies valeurs
- ✅ Utiliser les variables d'environnement de l'hébergeur
- ✅ Chiffrer les secrets sensibles

### 2. **CORS Configuration**
```javascript
// Dans ton backend
app.use(cors({
  origin: ['https://ton-frontend-domain.com'],
  credentials: true
}));
```

### 3. **Rate Limiting**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});

app.use('/api/', limiter);
```

### 4. **Helmet (Sécurité HTTP)**
```javascript
import helmet from 'helmet';
app.use(helmet());
```

## 📊 **Monitoring et Logs**

### 1. **Logs d'Application**
```javascript
// Ajouter dans ton backend
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### 2. **Health Check Endpoint**
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 3. **Métriques MongoDB**
- Surveille l'utilisation de la base de données
- Configure des alertes sur MongoDB Atlas
- Surveille les performances des requêtes

## 🔄 **CI/CD Pipeline**

### GitHub Actions (Exemple)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

## 🚨 **Dépannage**

### Problèmes Courants

1. **Erreur de connexion MongoDB**
   - Vérifie l'URI de connexion
   - Vérifie les permissions réseau dans MongoDB Atlas
   - Vérifie que l'IP de l'hébergeur est autorisée

2. **Erreur de build**
   - Vérifie que toutes les dépendances sont dans `package.json`
   - Vérifie la version de Node.js
   - Vérifie les scripts de build

3. **Erreur de variables d'environnement**
   - Vérifie que toutes les variables sont définies
   - Vérifie la syntaxe des variables
   - Redémarre l'application après modification

### Logs Utiles

```bash
# Vérifier les logs de l'application
heroku logs --tail

# Vérifier les variables d'environnement
heroku config

# Redémarrer l'application
heroku restart
```

## 📈 **Optimisation des Performances**

### 1. **Cache Redis (Optionnel)**
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache les résultats des requêtes fréquentes
app.get('/api/parts/stats', async (req, res) => {
  const cached = await redis.get('stats');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const stats = await getStats();
  await redis.setex('stats', 300, JSON.stringify(stats)); // 5 minutes
  res.json(stats);
});
```

### 2. **Compression**
```javascript
import compression from 'compression';
app.use(compression());
```

### 3. **CDN pour les Assets Statiques**
- Utilise un CDN pour les images
- Optimise les images
- Utilise la compression gzip

## 🎯 **Checklist de Déploiement**

- [ ] Variables d'environnement configurées
- [ ] Base de données MongoDB Atlas accessible
- [ ] Tests locaux validés
- [ ] Build de production testé
- [ ] Domaines configurés
- [ ] SSL/HTTPS activé
- [ ] Monitoring configuré
- [ ] Logs accessibles
- [ ] Backup configuré
- [ ] Documentation mise à jour

## 🎉 **Félicitations !**

Ta solution PcAnalys est maintenant prête pour un déploiement professionnel avec MongoDB Atlas !

**Prochaines étapes :**
1. Choisis ton hébergeur
2. Configure les variables d'environnement
3. Déploie
4. Teste en production
5. Configure le monitoring

---

**Besoin d'aide ?** Consulte la documentation de ton hébergeur ou contacte le support ! 