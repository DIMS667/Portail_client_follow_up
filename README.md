# FOLLOW-UP INSURANCE — démonstration interactive

Site public et portail client réunis dans une même application React + Vite pour présenter le parcours complet d’un cabinet de courtage en assurance.

L’interface utilise Tailwind CSS 4 et une bibliothèque de primitives shadcn/ui (Button, Card, Badge, Progress, Dialog, Tabs, Alert, Avatar, Separator et Skeleton). Le langage visuel reprend l’identité FOLLOW-UP INSURANCE : rouge de marque, accent orange et surfaces chaleureuses.

Ce projet est complètement séparé du back-office. Il n’utilise aucun backend, aucune API réelle, aucun paiement réel et aucun nom de compagnie définitif. Toutes les données sont fictives et stockées dans le navigateur sous la clé isolée `portail-client-demo:v1:db`.

## Identifiants de démonstration

```text
Email : jean.dupont@demo.com
Mot de passe : demo1234
```

## Fonctions principales

- page d’accueil institutionnelle et commerciale à la racine ;
- connexion, inscription et récupération simulées ;
- dashboard client et neuf scénarios de présentation ;
- demande automobile guidée en cinq étapes ;
- suivi des demandes et timelines ;
- comparaison de trois offres avec recommandation du courtier ;
- sélection d’une offre ;
- gestion des documents et correction d’une carte grise ;
- paiement réussi ou échoué simulé ;
- consultation des contrats, garanties et faux PDF ;
- demande de renouvellement ;
- déclaration et suivi d’un sinistre ;
- messagerie locale avec le courtier ;
- notifications lues et non lues ;
- profil et préférences ;
- navigation mobile inférieure ;
- réinitialisation exclusive des données du portail client.

## Architecture

```text
src/
├── app/             contexte, navigation locale et outils WebMCP
├── components/      coque client et composants partagés
├── data/            jeu initial de fake data
├── pages/           pages publiques, espace client et assistants
├── public-site/     accueil public, composants, contenus et configuration
├── repositories/    accès au localStorage
├── services/        logique métier et mutations
└── types/           modèles TypeScript

components/ui/       primitives shadcn/ui réutilisables
lib/                 utilitaires Tailwind et fusion de classes
```

Les composants ne lisent pas directement le stockage. La couche `repositories` pourra être remplacée plus tard par un repository FastAPI.

## Routes

### Routes publiques

```text
/
/connexion
/inscription
/mot-de-passe-oublie
```

### Espace client

```text
/espace
/espace/demandes
/espace/demandes/nouvelle
/espace/demandes/:reference
/espace/demandes/:reference/propositions
/espace/offres/:id
/espace/documents
/espace/paiements
/espace/contrats
/espace/contrats/:numero
/espace/renouvellements/:numero
/espace/sinistres
/espace/sinistres/nouveau
/espace/sinistres/:reference
/espace/messagerie
/espace/notifications
/espace/profil
/espace/aide
```

## Installation et lancement

Prérequis : Node.js 22 ou plus récent.

```powershell
cd "C:\PROJET DEV\App_courtier\portail-client-demo"
npm ci
npm run dev
```

Ouvrir ensuite `http://127.0.0.1:5173/`.

## Build de production

```powershell
npm run build
npm run start
```

Le site statique est généré dans `dist/`.

## Déploiement sur cPanel

1. Exécuter `npm ci` puis `npm run build`.
2. Dans cPanel, créer un sous-domaine indépendant, par exemple `client.domaine.com`.
3. Utiliser un document root séparé, par exemple `public_html/portail-client-demo`.
4. Compresser le **contenu** du dossier `dist`, pas le dossier `dist` lui-même.
5. Dans le File Manager cPanel, téléverser puis extraire l’archive dans le document root.
6. Vérifier que `index.html`, `assets/`, `documents-demo/` et `.htaccess` se trouvent directement dans ce dossier.
7. Activer la redirection HTTPS lorsque le certificat du sous-domaine est prêt.
8. Tester la page d’accueil, la connexion sur `/connexion` et l’actualisation directe d’une route profonde telle que `/espace/contrats`.

Le fichier `.htaccess` est inclus automatiquement dans le build et renvoie les routes de la SPA vers `index.html`.

Structure attendue :

```text
public_html/portail-client-demo/
├── index.html
├── assets/
├── documents-demo/
├── favicon.svg
└── .htaccess
```

## Déploiement alternatif sur Render

Le fichier `render.yaml` permet de créer un site statique Render :

- Build Command : `npm ci && npm run build`
- Publish Directory : `dist`

## Limites assumées

- les connexions et inscriptions sont simulées ;
- les fichiers sélectionnés ne sont pas stockés, seules leurs métadonnées le sont ;
- les paiements sont fictifs ;
- les compagnies A, B et C sont génériques ;
- les données restent propres au navigateur utilisé ;
- le lien réel avec le back-office viendra plus tard via FastAPI.
