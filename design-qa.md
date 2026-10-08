# Design QA — site public Follow-Up Insurance

Date: 2026-10-08

## Références comparées

- Direction visuelle approuvée: `docs/homepage-direction-3-reference.png`
- Implémentation vérifiée dans le navigateur: `http://127.0.0.1:5173/`
- Captures de contrôle: navigateur intégré Codex, onglet local `http://127.0.0.1:5173/`, vues 1440 × 900, 768 × 1024 et 375 × 812.

## Résultat visuel

L’implémentation conserve les marqueurs structurants de la direction choisie: en-tête blanc et compact, identité rouge/orange, grandes accroches éditoriales, compositions photographiques, blocs sans arrondis décoratifs, filets fins, CTA rouges et rythme de page ample. Les nouvelles pages reprennent le même langage visuel sans dupliquer artificiellement la page d’accueil.

Écarts observés puis corrigés:

1. Les liens d’ancrage de l’ancien site ont été remplacés par de vraies routes publiques avec état actif.
2. Les redirections commerciales répétées vers l’espace client ont été remplacées par un parcours de contact; l’accès client reste au header et discrètement au footer.
3. La position de défilement était conservée lors de certaines navigations SPA; un retour en haut de page est maintenant appliqué à chaque changement de route.
4. Les liens du footer pointent désormais vers chaque solution détaillée et vers de vraies pages légales provisoires.
5. Le formulaire de contact adapte son objet à l’URL et confirme explicitement son fonctionnement local de démonstration.
6. Le héros Sinistres utilise désormais le même fond, les mêmes proportions et le même CTA que les autres pages publiques.
7. Les visuels de héros ont une hauteur commune par breakpoint; le portrait de la page Conseils ne déforme plus la grille.
8. Le CTA principal du footer conserve un texte blanc dans tous ses états.

## Vérifications fonctionnelles

- 18 routes publiques chargées avec un titre, un H1, aucune image cassée et aucun débordement horizontal en vue ordinateur.
- Pages principales contrôlées à 375 px et 768 px sans débordement horizontal.
- Menu mobile: ouverture, fermeture et navigation validées.
- Navigation SPA: liens du header, du contenu, des cartes et du footer validés sans rechargement; historique précédent/suivant opérationnel.
- Navigation active: validée sur les pages de liste et de détail.
- Formulaire de contact: pré-sélection du motif, validation des champs et message de succès validés.
- FAQ: ouverture des réponses validée.
- Sinistre: un seul CTA de déclaration publique, redirigé vers la connexion puis le formulaire sécurisé.
- Console navigateur: aucune erreur ni alerte applicative.
- `npm run typecheck`: réussi.
- `npm run build`: réussi.
- `git diff --check`: réussi; seuls les avertissements CRLF attendus sous Windows sont présents.

## Décision

La fidélité est jugée suffisante pour la direction validée, avec les adaptations nécessaires à une architecture multi-page réelle et responsive.

final result: passed
