# PcAnalys - Solution avec Agent Local

## 🎯 Vue d'ensemble

Cette solution combine une interface web avec un agent local pour obtenir une analyse système complète et précise.

### Architecture
- **Frontend** : Interface web moderne (Next.js)
- **Backend** : API serveur (Node.js + Express)
- **Agent Local** : Petit exécutable qui analyse le système et envoie les données

## 🚀 Installation et Configuration

### 1. Construction de l'Agent

```bash
# Construire l'exécutable de l'agent
./build-agent.bat
```

L'agent sera créé dans `backend/utils/pcanalys-agent.exe`

### 2. Lancement du Serveur

```bash
# Lancer le backend
cd backend
npm start

# Lancer le frontend (dans un autre terminal)
cd frontend-pure
npm run dev
```

## 📱 Utilisation

### Pour l'utilisateur final

1. **Visiter le site** : http://localhost:3000
2. **Cliquer sur "Lancer l'analyse"**
3. **Si détection limitée** : Le site propose de télécharger l'agent
4. **Télécharger et exécuter l'agent** : `pcanalys-agent.exe`
5. **Retourner sur le site** et cliquer sur "Continuer avec l'Agent"
6. **Profiter de l'analyse complète** !

### Workflow détaillé

```
Utilisateur → Site Web → Détection Basique
                    ↓
              Données limitées ?
                    ↓
              OUI → Proposer Agent
                    ↓
              Télécharger Agent
                    ↓
              Exécuter Agent
                    ↓
              Agent → Analyse Système → Envoi au Serveur
                    ↓
              Retour Site → Récupération Données → Analyse IA
```

## 🔧 Configuration de l'Agent

### Variables d'environnement

L'agent peut être configuré via des arguments :

```bash
# Spécifier l'URL du serveur
pcanalys-agent.exe --server http://mon-serveur.com:4000

# Afficher l'aide
pcanalys-agent.exe --help
```

### Configuration par défaut

- **Serveur** : http://localhost:4000
- **Timeout** : 10 secondes
- **User-Agent** : PcAnalys-Agent/1.0

## 📊 Données Collectées

### Informations Système
- **CPU** : Marque, modèle, cœurs, vitesse
- **RAM** : Capacité, type, form factor, slots
- **GPU** : Marque, modèle, VRAM
- **Stockage** : Type, interface, capacité
- **OS** : Plateforme, version

### Sécurité
- ✅ Aucune donnée personnelle collectée
- ✅ Analyse système uniquement
- ✅ Communication chiffrée (HTTPS recommandé)
- ✅ Sessions temporaires (24h max)

## 🌐 Déploiement en Production

### 1. Serveur de Production

```javascript
// Modifier l'URL dans l'agent
const SERVER_URL = 'https://mon-serveur.com';
```

### 2. HTTPS

```bash
# Générer un certificat SSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### 3. Base de Données

Remplacer le stockage en mémoire par une base de données :

```javascript
// Au lieu de global.clientSessions
const sessions = await db.sessions.create({
  sessionId,
  data: clientData,
  timestamp: new Date()
});
```

## 🛠️ Développement

### Structure des Fichiers

```
backend/
├── utils/
│   ├── pcanalys-agent.js    # Agent principal
│   ├── package.json         # Dépendances agent
│   └── pcanalys-agent.exe   # Exécutable (généré)
├── src/
│   └── index.ts            # API serveur
└── scripts/
    └── get-system-info.ps1 # Script PowerShell (alternative)

frontend-pure/
└── src/app/diagnostic/
    └── page.tsx            # Interface utilisateur
```

### API Endpoints

- `POST /api/client-scan` : Réception des données agent
- `GET /api/client-sessions/recent` : Session la plus récente
- `GET /api/client-session/:id` : Données d'une session

## 🔍 Dépannage

### Agent ne se connecte pas
- Vérifier que le serveur est lancé
- Vérifier l'URL du serveur
- Vérifier le pare-feu

### Données manquantes
- Vérifier les permissions système
- Vérifier que systeminformation fonctionne
- Vérifier les logs de l'agent

### Session non trouvée
- Vérifier que l'agent s'est bien exécuté
- Vérifier les logs du serveur
- Vérifier que la session n'a pas expiré

## 📈 Avantages

✅ **Analyse complète** : Accès à toutes les informations système  
✅ **Interface moderne** : Web app responsive et intuitive  
✅ **Facilité d'utilisation** : Un seul clic pour l'agent  
✅ **Sécurité** : Aucune donnée personnelle  
✅ **Portabilité** : Fonctionne sur Windows  
✅ **Extensibilité** : Facile d'ajouter de nouvelles données  

## 🔮 Évolutions Futures

- [ ] Support Linux/Mac
- [ ] Interface graphique pour l'agent
- [ ] Analyse en temps réel
- [ ] Historique des analyses
- [ ] Comparaison de configurations
- [ ] Recommandations avancées 