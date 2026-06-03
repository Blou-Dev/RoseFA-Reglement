# RoseFA Docs

Documentation officielle RoseFA avec site public, panel admin prive, stockage Prisma et edition du reglement sans toucher au code.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite en local
- NextAuth / Auth.js
- Cloudinary possible en production pour les uploads

Note importante :
Le projet est configure en SQLite local par defaut pour le dev. Une sauvegarde complete du contenu peut etre faite avant migration via `npm run backup:content`, afin de preparer proprement un passage vers PostgreSQL en production sans perdre le reglement.

## Installation

1. Installer les dependances

```bash
npm install
```

2. Copier `.env.example` vers `.env`, puis renseigner au minimum :

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` si tu veux des uploads compatibles Vercel

3. Initialiser la base locale

```bash
npx prisma migrate dev
```

4. Injecter le contenu de base

```bash
npx prisma db seed
```

5. Lancer le projet

```bash
npm run dev
```

Le site est ensuite disponible sur `http://localhost:3000`.

## Auth admin

Le panel admin est accessible via `/admin`.

- si l'utilisateur n'est pas connecte, il est redirige vers `/admin/login`
- le compte principal defini dans `ADMIN_EMAIL` est le compte owner
- des comptes `writer` peuvent etre crees depuis `/admin/accounts`
- seuls les owners peuvent gerer les comptes writer
- les actions admin passent toutes par une verification serveur
- les routes API admin sont protegees

Le login utilise un provider `credentials` :

- owner : `ADMIN_EMAIL` + `ADMIN_PASSWORD`
- writers : comptes stockes en base via la page `/admin/accounts`

Tu peux utiliser un mot de passe en clair pour le dev, ou un hash bcrypt pour la prod.

## Edition du reglement

L'editeur admin permet maintenant :

- retour a la ligne propre
- gras
- italique
- souligne
- titres
- listes a puces
- separateur horizontal
- preview simple pendant l'edition

Le contenu enregistre garde sa mise en forme et s'affiche correctement cote public apres sauvegarde.

## Statut d'edition

Un verrou d'edition par categorie est actif dans l'admin :

- le statut apparait automatiquement des qu'une categorie a des modifications non sauvegardees
- le message affiche la categorie concernee
- l'editeur actif est affiche si disponible
- la session expire automatiquement apres inactivite
- si une autre session edite deja la meme categorie, l'edition est bloque

## Structure utile

- [app/(docs)/page.tsx](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/app/(docs)/page.tsx) : accueil RoseFA
- [app/(docs)/docs/[[...slug]]/page.tsx](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/app/(docs)/docs/[[...slug]]/page.tsx) : rendu public des pages
- [app/admin/page.tsx](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/app/admin/page.tsx) : dashboard admin
- [app/admin/accounts/page.tsx](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/app/admin/accounts/page.tsx) : gestion des comptes writer
- [components/admin/page-form.tsx](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/components/admin/page-form.tsx) : editeur des pages
- [components/admin/writer-accounts-manager.tsx](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/components/admin/writer-accounts-manager.tsx) : interface des comptes writer
- [lib/admin-actions.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/lib/admin-actions.ts) : CRUD admin
- [lib/editing-sessions.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/lib/editing-sessions.ts) : verrou d'edition
- [lib/docs.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/lib/docs.ts) : lecture des categories/pages
- [lib/auth.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/lib/auth.ts) : config auth
- [lib/auth-shared.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/lib/auth-shared.ts) : roles partages owner / writer
- [middleware.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/middleware.ts) : protection de `/admin`
- [app/api/admin/editing/route.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/app/api/admin/editing/route.ts) : heartbeat / lock d'edition
- [app/api/admin/upload/route.ts](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/app/api/admin/upload/route.ts) : upload image admin
- [prisma/schema.prisma](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/prisma/schema.prisma) : modele Prisma
- [scripts/backup-sqlite-content.mjs](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/scripts/backup-sqlite-content.mjs) : sauvegarde brute + JSON du contenu local
- [scripts/import-content-from-backup.mjs](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/scripts/import-content-from-backup.mjs) : reimport du contenu apres migration
- [.gitignore](/C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/.gitignore) : exclusions git

## Comment tester le systeme

1. Lancer `npm run dev`
2. Ouvrir `/admin/login`
3. Se connecter avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`
4. Ouvrir une page de reglement dans `/admin/pages/[id]`
5. Modifier un champ ou le contenu du texte
6. Verifier que le statut d'edition apparait
7. Utiliser les boutons gras, italique, souligne, titres, liste et retour ligne
8. Sauvegarder la page
9. Ouvrir la page publique correspondante dans `/docs/{category.slug}/{page.slug}`
10. Verifier que le texte rendu correspond bien a la mise en forme enregistree

Test de conflit :

1. Ouvrir la meme page ou une page de la meme categorie dans un second onglet
2. Commencer une modification dans le premier onglet
3. Verifier que le second voit le statut d'edition actif et ne peut pas modifier

Test d'expiration :

1. Ouvrir une page
2. Commencer une modification
3. Fermer brutalement l'onglet ou attendre la fin du delai d'expiration
4. Revenir ensuite sur l'edition et verifier que le verrou n'est plus actif

## Checklist avant hebergement

- definir un vrai `NEXTAUTH_SECRET`
- utiliser un vrai `ADMIN_PASSWORD`, idealement hash bcrypt
- mettre `NEXTAUTH_URL` sur l'URL finale du site
- sauvegarder le contenu avant migration : `npm run backup:content`
- utiliser PostgreSQL en production
- utiliser Cloudinary pour les uploads admin si le site est deploye sur Vercel
- verifier que `.env` n'est jamais pousse
- ne pas exposer le dossier `public/uploads` a des SVG ou scripts
- lancer `npm run build`

## Sauvegarde du contenu

Avant toute migration, tu peux sauvegarder ton contenu actuel avec :

```bash
npm run backup:content
```

Cela genere :

- une copie brute de `prisma/dev.db`
- un export JSON lisible dans le dossier `backups/`

Tu peux donc restaurer ton reglement meme si tu changes ensuite de base de donnees.

## Preparation Vercel + PostgreSQL

Le flux conseille pour mettre le site en ligne sans perdre le contenu :

1. Sauvegarder le contenu local :

```bash
npm run backup:content
```

2. Creer une base PostgreSQL de production

3. Mettre a jour `DATABASE_URL` avec l'URL PostgreSQL

4. Appliquer les migrations Prisma sur la nouvelle base :

```bash
npx prisma migrate deploy
```

5. Reimporter le contenu sauvegarde :

```bash
npm run import:content -- .\\backups\\ton-fichier-backup.json
```

6. Configurer les uploads Cloudinary avec :

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

7. Lancer un build de verification :

```bash
npm run build
```

## Important pour les uploads

- sans variables Cloudinary, l'admin continue d'uploader en local dans `public/uploads`
- avec Cloudinary configure, les images sont envoyees sur Cloudinary et l'URL distante est sauvegardee
- cela evite les pertes d'uploads sur un hebergement serverless type Vercel

## Securite actuelle

- aucune variable sensible n'est exposee cote client
- les pages admin sont protegees par middleware + verification serveur
- les actions admin verifient l'email autorise cote serveur
- les routes API admin `upload` et `editing` sont protegees
- les uploads SVG sont refuses
- un `.gitignore` exclut `.env`, `.next`, `node_modules`, `public/uploads` et la base locale
- le contenu edite bloque les motifs simples dangereux comme `script`, `iframe`, `javascript:` et certains handlers inline

Note :
Le dossier courant n'est pas initialise comme depot Git, donc il n'y avait pas d'historique commit a auditer ici. J'ai quand meme ajoute le `.gitignore` pour preparer proprement une future mise en repo.

## Verification effectuee

Commandes validees dans cet environnement :

```bash
npx prisma migrate dev
npx prisma generate
npm run build
```

Le build de production passe.
