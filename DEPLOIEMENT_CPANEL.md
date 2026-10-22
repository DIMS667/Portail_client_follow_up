# Déploiement automatique sur cPanel

Le workflow `.github/workflows/deploy-cpanel.yml` compile le portail pour `/portail-client/`, puis publie automatiquement le contenu de `dist/` à chaque push sur la branche `main`.

## 1. Créer le compte FTP dans cPanel

Dans **cPanel > FTP Accounts**, créez de préférence un compte limité au dossier du site. Selon la configuration de l’hébergement, ce dossier sera par exemple :

- `public_html` pour le domaine principal ;
- `public_html/nom-du-sous-domaine` pour un sous-domaine ;
- `/` si le compte FTP est déjà limité directement à la racine du site.

Activez FTPS lorsque l’hébergeur le permet. Ne placez jamais le mot de passe FTP dans un fichier du dépôt.

## 2. Ajouter les secrets GitHub

Dans le dépôt GitHub : **Settings > Secrets and variables > Actions > New repository secret**.

Créez ces quatre secrets :

| Secret | Valeur attendue |
| --- | --- |
| `CPANEL_FTP_SERVER` | Hôte FTP fourni par cPanel, sans `ftp://` |
| `CPANEL_FTP_USERNAME` | Nom complet du compte FTP |
| `CPANEL_FTP_PASSWORD` | Mot de passe du compte FTP |
| `CPANEL_FTP_DIRECTORY` | Dossier distant avec `/` final, par exemple `/public_html/` ou `/` |

Le dossier distant dépend de la racine attribuée au compte FTP. Dans le gestionnaire FTP de cPanel, vérifiez le champ **Directory** avant de choisir cette valeur.

## 3. Variables facultatives

Dans **Settings > Secrets and variables > Actions > Variables**, vous pouvez créer :

| Variable | Valeur par défaut | Autres valeurs |
| --- | --- | --- |
| `CPANEL_FTP_PROTOCOL` | `ftps` | `ftp` si l’hébergeur ne prend pas FTPS en charge |
| `CPANEL_FTP_PORT` | `21` | Le port indiqué par l’hébergeur |

## 4. Premier déploiement

1. Enregistrez puis poussez les fichiers sur `main`.
2. Ouvrez l’onglet **Actions** du dépôt GitHub.
3. Sélectionnez **Deploy to cPanel**.
4. Vérifiez que les étapes **Build client portal for /portail-client/** et **Deploy dist to cPanel over FTPS** sont vertes.

Le workflow peut également être lancé manuellement avec le bouton **Run workflow**.

## Routes React

Le fichier `public/.htaccess` est copié dans `dist/` pendant la compilation. Il redirige les routes comme `/portail-client/espace` vers `index.html`, tout en laissant les images et les autres fichiers statiques accessibles normalement.

Le portail est publié à l’adresse `https://followupassurance.com/portail-client/`. Cette adresse affiche directement la connexion, puis les pages authentifiées restent sous `/portail-client/espace`.
