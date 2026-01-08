# Second Wind - Site Web

Site web de l'agence de communication digitale Second Wind avec interface d'administration.

## 🚀 Déploiement sur Vercel

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de la base de données
1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte / Connectez-vous
3. Créez un nouveau projet depuis GitHub
4. Sélectionnez le repo `SitePietro`

### 3. Ajouter une base de données Postgres
1. Dans votre projet Vercel → Storage → Create Database
2. Sélectionnez "Postgres"
3. Donnez-lui un nom (ex: `second-wind-db`)
4. Cliquez sur "Create"

### 4. Initialiser la base de données
Après le premier déploiement, visitez :
```
https://votre-site.vercel.app/api/init-db
```

Cela créera automatiquement les tables `projects` et `actus`.

### 5. Accéder à l'admin
```
https://votre-site.vercel.app/admin.html
```
**Login :** admin  
**Password :** admin

## 📁 Structure du projet

```
/
├── index.html              # Page d'accueil
├── expertises.html         # Page expertises
├── projets.html           # Page projets
├── actus.html             # Page actualités
├── contact.html           # Page contact
├── admin.html             # Interface d'administration
├── styles.css             # Styles globaux
├── admin.js               # Logique admin + API calls
├── api/
│   ├── projects.js        # API endpoints projets
│   ├── actus.js           # API endpoints actualités
│   └── init-db.js         # Initialisation BDD
├── package.json           # Dépendances
└── vercel.json            # Configuration Vercel

```

## 🔧 Développement local

```bash
# Installer Vercel CLI
npm install -g vercel

# Lancer en local
vercel dev
```

Le site sera accessible sur `http://localhost:3000`

## 📝 Variables d'environnement

Les variables de connexion à la base de données sont automatiquement configurées par Vercel lors de l'ajout du service Postgres.

## 🎨 Fonctionnalités

- ✅ Site responsive (mobile, tablette, desktop)
- ✅ Interface d'administration complète
- ✅ Gestion des projets (CRUD)
- ✅ Gestion des actualités (CRUD)
- ✅ Base de données PostgreSQL
- ✅ API REST serverless
- ✅ Filtre "Afficher sur page d'accueil"

## 📞 Support

Pour toute question : contact@secondwind.com
