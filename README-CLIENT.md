# PcAnalys - Version Client

## 🎯 Solution pour l'analyse système locale

Cette version de PcAnalys permet d'analyser la configuration du PC sur lequel elle est lancée, en utilisant `systeminformation` pour obtenir des informations détaillées et précises.

## 🚀 Installation et Lancement

### Prérequis
- **Node.js** installé sur le PC (télécharger depuis https://nodejs.org/)
- **Windows** (les scripts sont en .bat)

### Lancement Rapide

1. **Double-cliquez sur `start-pcanalys.bat`**
   - Ce script va automatiquement :
     - Vérifier que Node.js est installé
     - Installer les dépendances si nécessaire
     - Configurer le frontend pour localhost
     - Lancer le backend sur le port 4000
     - Lancer le frontend sur le port 3000

2. **Ouvrez votre navigateur sur http://localhost:3000**

3. **Cliquez sur "Lancer l'analyse"**

## 📊 Informations Collectées

### CPU
- Marque et modèle exact
- Nombre de cœurs
- Vitesse de fonctionnement

### RAM
- Capacité totale
- Type (DDR3/DDR4/DDR5)
- Form factor (SODIMM/UDIMM)
- Nombre de slots et slots libres

### GPU
- Marque et modèle
- VRAM disponible
- Toutes les cartes graphiques détectées

### Stockage
- Type de disque (SSD/HDD)
- Interface (SATA/NVMe)
- Capacité de chaque disque

## 🔧 Scripts Disponibles

### `start-pcanalys.bat` (Recommandé)
- Lance automatiquement backend + frontend
- Configuration automatique
- Vérifications d'installation

### `start-client.bat`
- Lance uniquement le backend
- Pour utilisation avec interface web externe

### `start-frontend.bat`
- Lance uniquement le frontend
- Nécessite que le backend soit déjà lancé

## 🌐 Utilisation Réseau

Si vous voulez accéder à l'interface depuis un autre PC :

1. **Modifiez `frontend-pure/next.config.js`** :
```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://IP_DU_PC:4000/api/:path*',
      },
    ];
  },
};
```

2. **Lancez avec `start-pcanalys.bat`**

3. **Accédez depuis l'autre PC via http://IP_DU_PC:3000**

## 🛠️ Dépannage

### Erreur "Node.js n'est pas installé"
- Téléchargez et installez Node.js depuis https://nodejs.org/
- Redémarrez le script

### Erreur "Port déjà utilisé"
- Fermez les autres instances de PcAnalys
- Ou changez les ports dans les scripts

### Erreur "Dépendances manquantes"
- Le script installe automatiquement les dépendances
- Si problème, lancez manuellement :
  ```bash
  cd backend && npm install
  cd ../frontend-pure && npm install
  ```

## 📝 Avantages de cette Solution

✅ **Vraie détection** : Analyse le PC sur lequel l'application est lancée
✅ **Informations détaillées** : Utilise `systeminformation` pour des données précises
✅ **Facilité d'utilisation** : Un seul clic pour tout lancer
✅ **Portabilité** : Fonctionne sur n'importe quel PC Windows avec Node.js
✅ **Pas de configuration réseau** : Tout fonctionne en local

## 🔒 Sécurité

- Aucune donnée n'est envoyée sur Internet
- Analyse locale uniquement
- Pas de collecte de données personnelles 