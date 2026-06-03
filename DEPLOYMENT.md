# Deploiement Vercel + rosefa.org

Ce fichier te donne la vraie checklist de mise en ligne, sans perdre ton contenu actuel.

## 1. Variables a mettre dans Vercel

Dans `Vercel > Project > Settings > Environment Variables`, ajoute :

### Variables obligatoires

- `DATABASE_URL`
  Utilisee par l'application une fois la migration PostgreSQL terminee.

- `NEXTAUTH_SECRET`
  Une longue cle secrete aleatoire.

- `AUTH_SECRET`
  Mets la meme valeur que `NEXTAUTH_SECRET`.

- `NEXTAUTH_URL`
  Exemple final :
  `https://rosefa.org`

- `ADMIN_EMAIL`
  Ton email principal owner.

- `ADMIN_PASSWORD`
  Mot de passe owner.

- `ADMIN_UNLOCK_PASSWORD`
  Mot de passe du bouton de deverrouillage admin.

### Variables recommandees pour PostgreSQL

- `POSTGRES_DATABASE_URL`
  URL PostgreSQL de migration/import.

- `POSTGRES_DIRECT_URL`
  URL directe PostgreSQL si ton provider en fournit une.

### Variables recommandees pour les uploads

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

Si Cloudinary est configure, les bannieres admin seront stockees a distance, ce qui evite les pertes d'uploads sur Vercel.

## 2. Ou mettre ces variables

1. Ouvre ton projet dans Vercel
2. Va dans `Settings`
3. Ouvre `Environment Variables`
4. Ajoute chaque variable
5. Coche au minimum :
   - `Production`
   - `Preview`
   - `Development` si tu veux utiliser `vercel env pull`

## 3. Sauvegarde du contenu avant migration

Avant toute bascule :

```bash
npm run backup:content
```

Cela cree :

- une copie brute SQLite
- un export JSON lisible du reglement

## 4. Preparer PostgreSQL sans casser le projet local

Le projet local reste actuellement sur SQLite.

Le schema PostgreSQL de preparation est ici :

- [prisma/schema.postgres.prisma](C:/Users/adeol/Documents/RoseFA%20site%20du%20reglement/prisma/schema.postgres.prisma)

Les commandes a utiliser quand tu auras l'URL PostgreSQL :

```bash
npm run prisma:generate:postgres
npm run prisma:push:postgres
npm run import:content:postgres -- .\backups\ton-backup.json
```

## 5. Ce que fera la migration

1. Generation d'un client Prisma Postgres separe
2. Creation des tables sur PostgreSQL
3. Reimport du contenu depuis le backup JSON
4. Ensuite seulement, on bascule l'application principale sur PostgreSQL

## 6. Quand on sera pret a basculer l'app

La derniere etape consistera a :

- remplacer le schema principal SQLite par PostgreSQL
- faire pointer `DATABASE_URL` vers la vraie base Postgres
- redeployer sur Vercel

Je ne l'ai pas force maintenant pour eviter de casser ton setup local avant que la base prod soit prete.

## 7. Domaine Namecheap

Une fois le projet Vercel pret :

1. ajoute `rosefa.org` dans Vercel
2. Vercel te donnera les enregistrements DNS
3. copie-les dans Namecheap > Domain List > Manage > Advanced DNS
4. attends la propagation DNS

## 8. Etat actuel

Le projet est deja pret pour :

- GitHub
- backup de contenu
- generation d'un schema PostgreSQL separe
- import du contenu dans PostgreSQL
- uploads Cloudinary

Il manque seulement :

- ta vraie base PostgreSQL
- les variables Vercel
- la bascule finale de l'app principale
