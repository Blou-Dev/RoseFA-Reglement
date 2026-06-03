import { PrismaClient, PageStatus } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    title: "Règlement RoseFA",
    slug: "reglement-rosefa",
    description: "Les regles principales du serveur RoseFA.",
    order: 10,
    pages: [
      {
        title: "Lexique",
        slug: "lexique",
        description: "Les expressions RP et termes a connaitre pour bien jouer sur RoseFA.",
        excerpt: "Le vocabulaire utile pour rester immersif et comprendre les usages du serveur.",
        banner: "/images/rosefa-banner-main.png",
        order: 10,
        status: PageStatus.PUBLISHED,
        body: `## Comprendre le vocabulaire du serveur

Avant de participer a des scenes importantes, il est essentiel de connaitre les expressions les plus courantes du roleplay RoseFA.

<Alert title="Pourquoi ce lexique ?" variant="info">
Il permet d'eviter les ruptures d'immersion tout en gardant une communication claire lorsque la technique ou le contexte l'impose.
</Alert>

<Accordion
  items={[
    { title: "Mal de tete", content: "Expression utilisee pour signaler un souci technique, un freeze ou un ralentissement qui perturbe une scene." },
    { title: "Robespierre", content: "Mot code utilise pour parler d'un administrateur ou d'une intervention staff sans sortir du roleplay." },
    { title: "Unite X", content: "Designe une personne ou une information que l'on ne souhaite pas nommer precisement dans l'instant." },
    { title: "Tempete", content: "Annonce roleplay d'un redemarrage ou d'une relance du serveur." },
    { title: "Papillon", content: "Joueur qui tourne autour d'une scene, observe ou reste en flottement sans se positionner clairement." },
    { title: "Avoir un chewing-gum", content: "Designe un probleme de micro ou de voix robotisee pendant une interaction vocale." },
    { title: "Prendre une pastille", content: "Signifie qu'un joueur doit changer de canal vocal ou corriger un souci audio." },
    { title: "GoPro / DashCam / Lunette violette", content: "Indique qu'une scene est potentiellement captee ou exploitable selon les regles en vigueur du serveur." },
    { title: "Faire une sieste", content: "Annonce une deco/reco rapide pour resoudre un bug ou une desynchronisation." },
    { title: "Aller dormir", content: "Annonce une deconnexion plus longue ou une fin de session." },
    { title: "Parler chinois", content: "Utilise quand un message est incomprehensible, coupe ou inaudible." },
  ]}
/>`,
      },
      {
        title: "Notions de base",
        slug: "notions-de-base",
        description: "Les grands principes a respecter pour jouer un roleplay coherent et agreable.",
        excerpt: "Les fondamentaux de l'immersion, de la logique et de la construction de scene.",
        banner: "/images/rosefa-banner-rules.png",
        order: 20,
        status: PageStatus.PUBLISHED,
        body: `## Les bases d'un roleplay solide

Le roleplay RoseFA repose sur la coherence, la construction de scene et le respect de l'experience des autres joueurs.

<Card title="Immersion" description="Reste dans ton personnage et donne du sens a tes choix." />
<Card title="Cohesion" description="Favorise les scenes jouables et lisibles plutot que les reactions extremes." />
<Card title="Responsabilite" description="Assume les consequences de tes actes, qu'ils soient legaux ou illegaux." />

<Callout>
Un bon roleplay se reconnait autant a la qualite des interactions qu'au respect du rythme de la scene.
</Callout>`,
      },
      {
        title: "Règlement global",
        slug: "reglement-global",
        description: "Le cadre general du serveur, les comportements attendus et les principaux interdits.",
        excerpt: "La base commune a tous les joueurs, sans distinction de faction ou d'activite.",
        banner: "/images/rosefa-banner-rules.png",
        order: 30,
        status: PageStatus.PUBLISHED,
        body: `## Cadre general

Tous les joueurs doivent adopter une attitude respectueuse, serieuse et coherente avec l'univers RoseFA.

<Alert title="Principe fondamental" variant="warning">
Le but du reglement n'est pas de casser le jeu, mais de proteger la qualite des scenes et l'experience de toute la communaute.
</Alert>

## Attitude attendue

- Respecter les autres joueurs et le staff.
- Privilegier la construction de scene a la recherche de victoire immediate.
- Jouer avec logique, calme et coherence.
- Eviter tout comportement qui degrade volontairement l'experience des autres.

## Comportements a surveiller

- respect entre joueurs
- meta gaming
- no fear
- powergaming
- abus de mecaniques
- comportement toxique

## Sanctions

Les sanctions peuvent aller du rappel simple a l'exclusion temporaire ou definitive selon la gravite, la repetition et l'intention.

<Callout>
En cas de doute sur une situation non prevue, la lecture intelligente du contexte et la decision staff priment toujours.
</Callout>`,
      },
      {
        title: "Règlement légal",
        slug: "reglement-legal",
        description: "Le cadre de jeu pour les activites civiles, entreprises et metiers legaux.",
        excerpt: "Les attentes RP pour les activites legales et l'encadrement des services.",
        banner: "/images/rosefa-banner-legal.png",
        order: 40,
        status: PageStatus.PUBLISHED,
        body: `## Activites legales

Les emplois legaux, entreprises et services doivent etre joues avec serieux, lisibilite et sens des responsabilites.

## Qualite de service

- Offrir un roleplay lisible et professionnel.
- Respecter les procedures internes de sa structure.
- Garder un ton adapte a la fonction occupee.
- Ne pas utiliser son statut legal comme un pretexte a l'abus.

## Entreprises et institutions

Les entreprises, administrations et services doivent contribuer a l'ecosysteme du serveur. Un service legal est la pour creer du jeu, pas pour le bloquer.

<Alert title="Bon reflexe" variant="success">
Si une procedure te donne un avantage excessif ou casse une scene, priorise toujours la coherence RP et l'equilibre plutot que la lettre brute.
</Alert>`,
      },
      {
        title: "Règlement illégal",
        slug: "reglement-illegal",
        description: "Les limites et attentes pour les organisations criminelles, conflits et activites illegales.",
        excerpt: "Un cadre pour garder un illegal intense, mais jouable et coherent.",
        banner: "/images/rosefa-banner-illegal.png",
        order: 50,
        status: PageStatus.PUBLISHED,
        body: `## Activites illegales

Le roleplay illegal doit rester structure, comprehensible et proportionne. Les scenes doivent privilegier la narration et l'equilibre.

## Intensite et coherence

- Toute action illegale doit avoir une logique RP.
- La recherche de scene passe avant la recherche de loot ou de resultat.
- Les conflits doivent rester lisibles pour tous les participants.
- Les prises d'otages, braquages et confrontations doivent conserver des limites claires.

## Organisations

Une organisation credible se construit avec des objectifs, une hierarchie, une communication et des consequences.

<Callout>
Tu peux centraliser ici les regles sur les braquages, guerres, prises d'otages, cooldowns et pertes memoire.
</Callout>`,
      },
      {
        title: "Règlement boutique",
        slug: "reglement-boutique",
        description: "Les informations et limites autour des achats, avantages et contenus lies a la boutique RoseFA.",
        excerpt: "Un cadre clair pour presenter la boutique sans ambiguite.",
        banner: "/images/rosefa-banner-shop.png",
        order: 60,
        status: PageStatus.PUBLISHED,
        body: `## Boutique RoseFA

Cette page sert a expliquer le fonctionnement de la boutique, les delais, les categories d'achats et les regles associees.

<Card title="Transparence" description="Explique ce que chaque offre apporte concretement." />
<Card title="Encadrement" description="Detaille les procedures en cas de retard, bug ou verification manuelle." />

## Regles utiles

- Un achat ne donne pas le droit de contourner le reglement.
- Les contenus boutique doivent respecter l'equilibre du serveur.
- Les demandes de support doivent etre formulees proprement avec preuve ou reference si besoin.`,
      },
    ],
  },
  {
    title: "Guides utiles",
    slug: "guides-utiles",
    description: "Les guides pratiques pour bien utiliser le serveur et resoudre les problemes courants.",
    order: 20,
    pages: [
      {
        title: "Se connecter a RoseFA",
        slug: "se-connecter-a-rosefa",
        description: "Le guide de connexion et d'onboarding pour les nouveaux joueurs.",
        excerpt: "Les prerequis et etapes utiles avant de rejoindre le serveur.",
        banner: "/images/rosefa-banner-guide.png",
        order: 10,
        status: PageStatus.PUBLISHED,
        body: `## Avant de rejoindre le serveur

Verifie FiveM, Discord et tes acces communautaires avant de te connecter.

1. Rejoins le Discord.
2. Lis le reglement.
3. Verifie tes roles ou prerequis.
4. Lance FiveM et connecte-toi a RoseFA.`,
      },
      {
        title: "Résolution bugs",
        slug: "resolution-bugs",
        description: "Les procedures de base pour regler les problemes techniques les plus frequents.",
        excerpt: "Une routine simple avant d'ouvrir un ticket support.",
        banner: "/images/rosefa-banner-support.png",
        order: 20,
        status: PageStatus.PUBLISHED,
        body: `## Routine de depannage

- relancer FiveM
- vider le cache
- verifier Discord
- refaire une reconnexion propre

<Alert title="Avant d'ouvrir un ticket" variant="warning">
Demande toujours une description claire du bug, l'heure, les etapes de reproduction et si possible une capture.
</Alert>`,
      },
      {
        title: "Boutique",
        slug: "boutique",
        description: "Guide pratique autour de la boutique RoseFA et de son utilisation.",
        excerpt: "Fonctionnement, bonnes pratiques et points de vigilance avant un achat.",
        banner: "/images/rosefa-banner-shop.png",
        order: 30,
        status: PageStatus.PUBLISHED,
        body: `## Bien utiliser la boutique

Cette page peut presenter les offres, les avantages, les delais de livraison et la marche a suivre en cas de souci.`,
      },
      {
        title: "Support",
        slug: "support",
        description: "Le point d'entree pour l'aide, les tickets et les demandes staff.",
        excerpt: "Comment demander de l'aide efficacement sans perdre de temps.",
        banner: "/images/rosefa-banner-support.png",
        order: 40,
        status: PageStatus.PUBLISHED,
        body: `## Obtenir de l'aide

Oriente ici les joueurs vers les tickets, le Discord et les bons canaux de support selon leur besoin.

<Card title="Ticket technique" description="Pour les bugs, crashes, pertes et problemes de connexion." />
<Card title="Question rapide" description="Pour une information simple ou un besoin de redirection." />`,
      },
      {
        title: "F.A.Q. staff / joueurs",
        slug: "faq",
        description: "Les reponses aux questions les plus frequentes des joueurs RoseFA.",
        excerpt: "Un espace simple pour centraliser les questions recurrentes.",
        banner: "/images/rosefa-banner-update.png",
        order: 50,
        status: PageStatus.PUBLISHED,
        body: `## Foire aux questions

Cette page sert a centraliser les demandes recurrentes des joueurs et du staff afin d'eviter les allers-retours inutiles.

<Accordion
  items={[
    { title: "Je suis nouveau, par quoi commencer ?", content: "Lis en priorite le lexique, les notions de base et le reglement global. Ensuite, passe sur le guide de connexion et garde la sidebar comme repere." },
    { title: "Que faire si je trouve une faille ou un abus ?", content: "Ne l'exploite pas. Signale-la proprement au staff avec un maximum de contexte, captures ou etapes de reproduction." },
    { title: "Quand faut-il ouvrir un ticket support ?", content: "Quand un probleme persiste apres les verifications de base ou qu'une situation demande une intervention staff structuree." },
    { title: "Le staff peut-il trancher une situation non ecrite ?", content: "Oui. Le reglement ne peut pas couvrir tous les cas. La decision staff prime lorsqu'une situation sort du cadre prevu." },
    { title: "Peut-on contourner une regle par interpretation ?", content: "Non. Toute tentative d'abus, de vide ou de contournement volontaire peut etre sanctionnee meme si le cas n'est pas formule mot pour mot." },
    { title: "Comment bien rediger une demande d'aide ?", content: "Explique le probleme, l'heure, les personnes impliquees, ce que tu as deja teste et ajoute une capture si c'est pertinent." },
  ]}
/>

## Conseils staff

- Repondre de facon claire et uniforme.
- Rediriger vers la bonne page plutot que reecrire la doc a chaque fois.
- Garder une trace des problemes recurrentes pour enrichir la documentation.`,
      },
    ],
  },
];

async function main() {
  await prisma.page.deleteMany();
  await prisma.category.deleteMany();

  for (const category of categories) {
    const { pages, ...categoryData } = category;
    await prisma.category.create({
      data: {
        ...categoryData,
        pages: {
          create: pages,
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
