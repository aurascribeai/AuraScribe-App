
export const translations = {
  fr: {
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      compliance: 'Conformité',
      pricing: 'Tarifs',
      faq: 'FAQ',
      blog: 'Blogue',
      contact: 'Contact',
      login: 'Connexion',
      startTrial: 'Essai gratuit',
    },
    hero: {
      newBadge: 'Nouveau : Agent de Preuves Visuelles',
      headline: 'Concentrez-vous sur le patient,',
      headlineHighlight: 'pas sur la paperasse.',
      subhead: 'Le scribe médical IA qui va au-delà des attentes. Générez notes, prescriptions, requêtes, références, billets médicaux, facturation RAMQ et formulaires MADO en quelques secondes.',
      cta: 'Essai gratuit 14 jours',
      noCard: 'Aucune carte de crédit requise',
      compliance: 'Conforme Loi 25 (QC) & LPRPDE',
      dataResidency: 'Données hébergées à Montréal (GCP)',
      stats: {
        time: 'Gagnez 2h de rédaction / jour',
        residency: '100% Hébergé à Montréal',
        specialties: '15+ Spécialités Médicales',
      }
    },
    coreTech: {
      title: 'Le moteur clinique intelligent',
      subtitle: 'Une architecture neuronale complexe qui transforme la voix en données médicales structurées.',
      nodes: {
        transcripts: 'Transcription Intelligente',
        topics: 'Détection de Sujets',
        formatting: 'Formatage Structuré',
        intent: 'Détection d\'Intention',
        sentiment: 'Analyse de Sentiment',
        model: 'Modèle Clinique'
      }
    },
    integrations: {
      title: 'S\'intègre à votre écosystème clinique',
      subtitle: 'Synchronisation directe avec les principaux DMÉ canadiens et services de fax.'
    },
    video: {
      title: 'Découvrez la plateforme',
      subtitle: 'Regardez comment AuraScribe transforme une consultation typique en moins de 2 minutes.',
    },
    demo: {
      title: 'Voyez AuraScribe en action',
      subtitle: 'Simulez une consultation audio ou une analyse d\'image clinique.',
      modes: {
        audio: 'Scribe Audio',
        visual: 'Agent Visuel'
      },
      inputTitle: 'Transcription en direct',
      visualInputTitle: 'Analyse d\'image',
      outputTitle: 'Note Générée (SOAP)',
      visualOutputTitle: 'Rapport Dermatologique',
      btnRecord: 'Lancer la simulation',
      btnScan: 'Analyser l\'image',
      btnProcessing: 'Extraction des entités...',
      btnAnalyzing: 'Scan des lésions...',
      btnReset: 'Nouvelle simulation',
      rawTranscript: "Le patient rapporte une fatigue chronique et des douleurs articulaires depuis 3 mois. Il note que le repos n'améliore pas les symptômes. Examen physique normal, pas de signes inflammatoires. Je prescris 5mg de prednisone pour voir la réponse et je demande un bilan sanguin complet.",
      processingSteps: {
        listening: 'Écoute active...',
        analyzing: 'Analyse clinique...',
        structuring: 'Formatage SOAP...'
      },
      generatedSoap: {
        s: "Fatigue chronique et arthralgies signalées depuis 3 mois. Sommeil non réparateur.",
        o: "Examen physique normal. Amplitude articulaire complète. Pas d'œdème.",
        a: "Fatigue chronique idiopathique, possible composante inflammatoire.",
        p: "Prescription: Prednisone 5mg die. Bilan sanguin (FSC, VS, CRP) demandé. Suivi 4 semaines."
      },
      visualAnalysis: {
        findings: "Plaque érythémateuse bien délimitée avec squames argentées sur la surface extenseur du coude.",
        diagnosis: "Psoriasis en plaques (Psoriasis Vulgaris).",
        confidence: "98.4%",
        recommendation: "Corticostéroïdes topiques (ex: bétaméthasone) et analogues de la vitamine D."
      },
      transparency: {
        title: "Transparence Logique (Art 12.1 Compliance)",
        parameters: "Paramètres : Dictée médecin ; Guide : ICD-10-CA.",
        reasoning: "Raisonnement : Synthèse structurée basée sur les points saillants de la consultation.",
        disclaimer: "AVERTISSEMENT : Ce document est généré par IA et doit être révisé par un professionnel.",
        confidenceLabel: "Indice de complétude : Élevé",
        insufficient: "Information insuffisante pour [X]; veuillez fournir une clarification clinique."
      }
    },
    howItWorks: {
      title: 'Comment ça marche',
      subtitle: 'Votre assistant clinique en 4 étapes simples.',
      steps: [
        { title: 'Enregistrez', desc: 'Lancez l\'enregistrement sécurisé au début de la consultation.' },
        { title: 'L\'IA Analyse', desc: 'AuraScribe transcrit et structure les données médicales instantanément.' },
        { title: 'Révisez', desc: 'Validez les documents générés (Note, Rx, Requêtes, Références) et ajoutez vos observations.' },
        { title: 'Intégrez', desc: 'Exportez directement vers Omnimed, TELUS ou MYLE en un clic.' }
      ]
    },
    features: {
      title: 'Plus qu\'un simple scribe',
      subtitle: 'AuraScribe génère tout : Notes cliniques, Prescriptions, Requêtes labo, Références, Billets, et plus encore.',
      items: [
        { title: 'Documentation Complète', desc: 'Ne vous limitez pas aux notes. Obtenez automatiquement prescriptions, requêtes de laboratoire, lettres de référence et billets d\'absence.' },
        { title: 'Cerveau Clinique Bilingue', desc: 'Conçu pour le paysage médical du Québec. Transcrivez en français ou en anglais ; obtenez des documents parfaits dans la langue de votre choix.' },
        { title: 'Écosystème Multi-Agents', desc: 'Pas seulement un scribe. Une équipe de spécialistes IA : un Agent Clinique, un Agent de Recherche et un Agent Visuel à vos côtés.' },
        { title: 'Conformité Loi 25 & HIPAA', desc: 'Vos données restent à Montréal. Entièrement conforme à la Loi 25. Journaux d\'audit automatisés pour une tranquillité d\'esprit totale.' },
        { title: 'Formulaires Auto (MADO & RAMQ)', desc: 'Automatisez le pénible. Remplissez automatiquement les formulaires MADO et capturez chaque opportunité de facturation RAMQ.' },
        { title: 'Partage Sécurisé AuraLink™', desc: 'Partagez des prescriptions et des instructions en toute sécurité avec les patients via des liens chiffrés et limités dans le temps.' },
        { title: 'Synchro DMÉ & E-Fax', desc: 'S\'intègre à votre flux. Synchro un clic vers Omnimed et TELUS. Faxez les prescriptions directement via l\'intégration SRFax.' },
        { title: 'Flexibilité Vocale', desc: 'Fonctionne là où vous travaillez. Consultations en personne, dictée directe ou sessions de télésanté—AuraScribe entend tout avec précision.' }
      ]
    },
    testimonials: {
      title: 'Approuvé par les cliniciens d\'ici',
      subtitle: 'Rejoignez des centaines de médecins qui gagnent 2h par jour.',
      items: [
        { quote: "Enfin un outil qui comprend le 'Franglais' médical de Montréal. Mes notes sont faites avant que le patient ne quitte la salle.", author: "Dr. Tremblay", role: "Cardiologue", location: "CHUM, Montréal" },
        { quote: "La conformité à la Loi 25 était ma priorité. L'hébergement local et le BAA signé m'ont convaincue.", author: "Dr. Nguyen", role: "Médecin de famille", location: "Clinique privée, Québec" },
        { quote: "Je ne passe plus mes soirées à faire de la paperasse. C'est un changement de vie complet.", author: "Dr. Smith", role: "Pédiatre", location: "Gatineau" }
      ]
    },
    compliance: {
      tag: 'Sécurité d\'abord',
      title: 'Sécurité de niveau entreprise.',
      titleHighlight: 'Conforme Loi 25.',
      description: 'La confiance des patients est votre devise. Nous avons bâti AuraScribe avec une architecture qui dépasse les normes réglementaires canadiennes.',
      items: [
        { title: 'Région GCP Montréal', desc: 'Toutes les données sont traitées et stockées exclusivement dans la région Montréal de Google Cloud (northamerica-northeast1).' },
        { title: 'Transparence Art. 12.1', desc: 'Nous informons les usagers de l\'utilisation de traitements automatisés pour la synthèse clinique. Chaque note est soumise à révision humaine.' },
        { title: 'Chiffrement de bout en bout', desc: 'Données chiffrées en transit et au repos (AES-256). Journaux d\'audit stricts conformément à la Loi 25.' },
        { title: 'Cadre de Normes de Soins', desc: 'AuraScribe fonctionne comme un outil de soutien à la décision. Le diagnostic final et les décisions cliniques restent la responsabilité exclusive du professionnel licencié.' }
      ],
      sovereign: 'Souveraineté des données',
      sovereignDesc: 'Vos données ne quittent jamais le sol canadien.'
    },
    pricing: {
      title: 'Tarification simple et transparente',
      subtitle: 'Commencez gratuitement. Évoluez selon vos besoins.',
      mostPopular: 'Plus Populaire',
      tiers: [
        { name: 'Essai Gratuit', price: '0 $', desc: 'Découvrez la puissance d\'AuraScribe sans risque.', cta: 'Démarrer l\'essai', features: ['Accès 14 jours', 'Notes illimitées', 'Toutes les spécialités', 'Aucune carte requise'] },
        { name: 'Plan Pro', price: '99 $', desc: 'Pour les cliniciens individuels cherchant l\'efficacité.', cta: 'Commencer', features: ['Notes illimitées', 'Support bilingue', 'Analyse visuelle', 'Support intégration DMÉ', 'Support courriel prioritaire'] },
        { name: 'Plan Clinique', price: 'Sur mesure', desc: 'Pour les cliniques de 5+ praticiens.', cta: 'Contacter les ventes', features: ['Tout du plan Pro', 'Facturation centralisée', 'Tableau de bord admin', 'Formation dédiée', 'BAA personnalisé'] }
      ]
    },
    contact: {
      title: 'Contactez-nous',
      subtitle: 'Une question ? Notre équipe basée à Montréal est là pour vous aider.',
      infoTitle: 'Coordonnées',
      formTitle: 'Envoyez-nous un message',
      phiWarning: 'AVERTISSEMENT : Ne pas inclure de renseignements personnels sur la santé (RAMQ, diagnostics de patients) dans ce formulaire. Utilisez votre portail sécurisé pour le support clinique.',
      labels: {
        name: 'Nom complet',
        email: 'Adresse courriel',
        subject: 'Sujet',
        message: 'Message',
        submit: 'Envoyer le message',
        sending: 'Envoi en cours...',
        success: 'Message envoyé avec succès !',
        privacyConsent: "J'accepte que mes informations soient traitées conformément à la Politique de Confidentialité."
      },
      details: {
        email: 'contact@app.aurascribe.ca',
        phone: '(438) 402-4751',
        address: '3200 Boulevard Cartier Ouest, Laval, QC H7V 1J7'
      }
    },
    faq: {
      title: "Questions Fréquentes",
      subtitle: "Tout ce que vous devez savoir avant de moderniser votre pratique.",
      items: [
        { q: "Est-ce compatible avec mon DMÉ ?", a: "Oui, AuraScribe s'intègre directement avec Omnimed, TELUS (PS Suite, Medesync) et MYLE. Pour les autres, nous offrons une fonctionnalité copier-coller intelligente." },
        { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Vos données sont chiffrées de bout en bout (AES-256) et stockées exclusivement au Canada (région Montréal de Google Cloud), en conformité totale avec la Loi 25 et la LPRPDE." },
        { q: "L'IA comprend-elle les accents québécois ?", a: "Oui. Notre modèle a été spécifiquement entraîné sur des milliers d'heures de dialogues médicaux en français québécois et en 'franglais' montréalais pour assurer une précision maximale." },
        { q: "Puis-je annuler à tout moment ?", a: "Oui, nos forfaits sont mensuels et sans engagement à long terme. Vous pouvez annuler votre abonnement directement depuis votre tableau de bord sans pénalité." },
        { q: "Est-ce que l'IA enregistre la conversation ?", a: "L'audio est traité en temps réel pour générer la note, puis il est immédiatement supprimé de nos serveurs une fois la transcription validée, sauf si vous choisissez explicitement de le conserver pour vos archives." }
      ]
    },
    blog: {
      title: 'Perspectives Cliniques',
      subtitle: 'Réflexions sur l\'avenir de la médecine, l\'IA et l\'efficacité administrative.',
      readMore: 'Lire la suite',
      searchPlaceholder: 'Rechercher des articles...',
      subscribeTitle: "Restez à l'affût",
      subscribeDesc: "Recevez les dernières nouvelles sur l'IA médicale et nos mises à jour produits directement dans votre boîte de réception.",
      subscribeBtn: "S'abonner",
      emailPlaceholder: "votre@courriel.com",
      categories: {
        all: 'Tous'
      },
      posts: [
        {
          slug: "le-premier-sacrifie-votre-temps",
          title: "Le premier sacrifié : votre temps",
          category: "Burnout",
          excerpt: "La fragmentation des outils impose une charge cognitive et ralentit chaque action. Découvrez comment la surcharge administrative mène à l'épuisement.",
          content: `
            <p class="lead">La médecine moderne est en crise. Non pas par manque de connaissances ou de traitements, mais par manque de temps.</p>
            <p>Chaque jour, un médecin consacre en moyenne 2 à 3 heures à la documentation clinique. Ce "travail invisible" s'accumule, grignotant les soirées, les week-ends et, ultimement, la qualité de vie des praticiens. Le phénomène porte un nom : la "charge administrative".</p>
            <h3>La fragmentation de l'attention</h3>
            <p>Les Dossiers Médicaux Électroniques (DMÉ) promettaient l'efficacité. En réalité, ils ont transformé les médecins en opérateurs de saisie de données. Au lieu de regarder le patient dans les yeux, le regard est rivé sur l'écran, naviguant à travers des menus déroulants et des cases à cocher.</p>
            <p>Cette fragmentation de l'attention a un coût cognitif élevé. Le cerveau humain n'est pas fait pour le multitâche intensif requis par la consultation moderne : écouter, analyser, diagnostiquer, empathiser, et documenter simultanément.</p>
            <h3>L'IA comme remède</h3>
            <p>C'est ici qu'intervient l'intelligence artificielle. Non pas pour remplacer le médecin, mais pour le libérer. En automatisant la capture et la structuration des données, des outils comme AuraScribe redonnent au médecin sa ressource la plus précieuse : son attention pleine et entière.</p>
            <p>Imaginez une consultation où l'ordinateur se fait oublier. Où la technologie devient invisible. C'est la promesse d'une IA éthique et bien conçue.</p>
          `,
          date: "12 Mars 2024",
          readTime: "3 min"
        },
        {
          slug: "symphonie-agents-intelligents",
          title: "Une symphonie d'agents intelligents",
          category: "IA Médicale",
          excerpt: "AuraScribe n'est pas un outil unique, but une symphonie d'agents spécialisés qui collaborent pour exécuter votre partition administrative.",
          content: `
            <p class="lead">L'intelligence artificielle générative a fait un bond en avant spectaculaire. Mais un seul modèle, aussi puissant soit-il, ne peut pas tout faire parfaitement.</p>
            <p>En médecine, la précision est non négociable. Un modèle excellent pour rédiger une lettre empathique peut être médiocre pour coder une facturation RAMQ complexe. C'est pourquoi nous avons adopté une approche multi-agents.</p>
            <h3>L'Agent Clinique</h3>
            <p>Spécialisé dans la terminologie médicale, il écoute la conversation et extrait les symptômes, les antécédents et les observations physiques. Il structure ces informations en format SOAP standardisé.</p>
            <h3>L'Agent Administratif</h3>
            <p>Il travaille en parallèle pour identifier les codes de facturation, remplir les formulaires MADO et préparer les requêtes de laboratoire. Il connaît les règles de la RAMQ sur le bout des doigts et ne manque aucune opportunité.</p>
            <h3>L'Agent de Recherche</h3>
            <p>Il vérifie les interactions médicamenteuses et suggère des références basées sur les dernières lignes directrices cliniques. C'est un filet de sécurité supplémentaire qui opère en arrière-plan.</p>
            <p>Ensemble, ces agents forment une équipe invisible mais omniprésente, transformant AuraScribe en bien plus qu'un simple outil de dictée.</p>
          `,
          date: "5 Mars 2024",
          readTime: "5 min"
        },
        {
          slug: "conversation-trois-actions",
          title: "D'une conversation à trois actions",
          category: "Efficacité",
          excerpt: "Notes de consultation structurées, formulaires préremplis et ordonnances sécuritaires : tout cela généré à partir d'une simple conversation.",
          content: `
            <p class="lead">L'efficacité clinique ne se mesure pas au nombre de patients vus, mais à la qualité de l'interaction et à la fluidité du processus.</p>
            <p>Traditionnellement, une consultation de 15 minutes génère 10 minutes de travail administratif subséquent. Rédaction de la note, impression de la prescription, envoi du fax à la pharmacie, rédaction de la référence...</p>
            <h3>Le flux de travail unifié</h3>
            <p>Avec AuraScribe, la voix devient l'interface unique. Une simple instruction vocale durant la consultation ("Je vais vous prescrire de l'Amoxicilline 500mg pour 7 jours") déclenche une cascade d'actions numériques.</p>
            <ol>
              <li>La prescription est rédigée et prête à être signée.</li>
              <li>La note au dossier est mise à jour avec le plan de traitement.</li>
              <li>Le patient reçoit les instructions de prise via un lien sécurisé.</li>
            </ol>
            <p>Ce changement de paradigme permet de clore le dossier 30 secondes après le départ du patient, plutôt qu'à la fin de la journée.</p>
          `,
          date: "28 Fév 2024",
          readTime: "4 min"
        }
      ]
    },
    legal: {
      privacy: {
        title: "Politique de Confidentialité",
        lastUpdated: "Dernière mise à jour : 10 Avril 2024",
        sections: [
          { heading: "1. Introduction", content: "app.AuraScribe.ca (« nous », « notre » ou « nos ») respecte votre vie privée. Cette Politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous visitez notre site web app.AuraScribe.ca." },
          { heading: "2. Informations que nous collectons", content: "Nous pouvons collecter des renseignements personnels que vous nous fournissez volontairement, notamment : Coordonnées (nom, adresse e-mail, numéro de téléphone), Informations de facturation, Communications que vous nous envoyez, Données d'utilisation et analyses." },
          { heading: "3. Utilisation de vos informations", content: "Nous utilisons les informations collectées pour : Fournir, exploiter et maintenir nos services, Traiter vos transactions, Communiquer avec vous, Améliorer notre site web et services, Respecter nos obligations légales." },
          { heading: "4. Partage de vos informations", content: "Nous ne vendons pas vos renseignements personnels. Nous pouvons partager des informations : Avec des fournisseurs de services qui assistent nos opérations, Pour respecter des exigences légales, Avec votre consentement." },
          { heading: "5. Sécurité des données", content: "Nous mettons en œuvre des mesures de sécurité raisonnables pour protéger vos renseignements personnels. Cependant, aucune transmission ou stockage électronique n'est sécurisé à 100 %." },
          { heading: "6. Vos droits", content: "En vertu des lois canadiennes sur la protection de la vie privée, vous avez le droit de : Accéder à vos renseignements personnels, Corriger les informations inexactes, Retirer votre consentement (sous réserve de restrictions légales ou contractuelles), Déposer une plainte auprès du Commissaire à la protection de la vie privée du Canada." },
          { heading: "7. Coordonnées", content: "Responsable de la protection de la vie privée : Salah Taileb | Courriel : salah.taileb@Auralistech.ca | Téléphone : 438-402-4751 | Adresse : 3200 boulevard Cartier Ouest, Laval QC H7V 1J7, Canada" },
          { heading: "8. Modifications de cette politique", content: "Nous pouvons mettre à jour cette politique périodiquement. La version mise à jour sera publiée sur notre site web." }
        ]
      },
      terms: {
        title: "Conditions d'Utilisation",
        lastUpdated: "Dernière mise à jour : 10 Avril 2024",
        sections: [
          { heading: "1. Acceptation des conditions", content: "En accédant et utilisant app.AuraScribe.ca, vous acceptez et convenez d'être lié par ces Conditions d'utilisation." },
          { heading: "2. Licence d'utilisation", content: "Nous vous accordons une licence limitée, non exclusive, non transférable d'utiliser notre site web à des fins personnelles ou commerciales comme prévu." },
          { heading: "3. Responsabilités de l'utilisateur", content: "Vous convenez de : Fournir des informations exactes, Ne pas utiliser le site à des fins illégales, Ne pas interférer avec la sécurité ou la fonctionnalité du site." },
          { heading: "4. Propriété intellectuelle", content: "Tout le contenu sur app.AuraScribe.ca est notre propriété ou sous licence et protégé par les lois sur le droit d'auteur et la propriété intellectuelle." },
          { heading: "5. Limitation de responsabilité", content: "Dans la mesure maximale permise par la loi, nous ne serons pas responsables des dommages indirects, accessoires ou consécutifs découlant de votre utilisation de notre site web." },
          { heading: "6. Droit applicable", content: "Ces Conditions sont régies par les lois du Québec et du Canada. Tout litige sera soumis à la compétence exclusive des tribunaux du Québec." },
          { heading: "7. Modifications", content: "Nous nous réservons le droit de modifier ces Conditions à tout moment. L'utilisation continue constitue l'acceptation des changements." },
          { heading: "8. Contact", content: "Pour des questions sur ces Conditions, contactez : Salah Taileb | salah.taileb@auralistech.ca | 438-402-4751 | 3200 boulevard Cartier Ouest, Laval QC H7V 1J7, Canada" }
        ]
      },
      cookies: {
        title: "Politique sur les Cookies",
        lastUpdated: "Dernière mise à jour : 10 Avril 2024",
        sections: [
          { heading: "1. Que sont les cookies", content: "Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez des sites web. Ils aident les sites web à fonctionner correctement et fournissent des informations aux propriétaires de sites web." },
          { heading: "2. Comment nous utilisons les cookies", content: "app.AuraScribe.ca utilise des cookies pour : Assurer le bon fonctionnement du site web, Mémoriser vos préférences, Analyser le trafic et l'utilisation du site web, Améliorer l'expérience utilisateur." },
          { heading: "3. Types de cookies que nous utilisons", content: "Cookies essentiels : Nécessaires au fonctionnement de base du site web. Cookies analytiques : Nous aident à comprendre comment les visiteurs interagissent avec notre site. Cookies de préférence : Mémorisent vos paramètres et préférences." },
          { heading: "4. Vos choix concernant les cookies", content: "Vous pouvez contrôler les cookies via les paramètres de votre navigateur. La plupart des navigateurs vous permettent de : Voir quels cookies sont stockés, Supprimer des cookies individuels ou tous les cookies, Bloquer les cookies de sites spécifiques ou de tous les sites, Définir des préférences pour différents types de cookies." },
          { heading: "5. Cookies tiers", content: "Nous pouvons utiliser des services tiers qui placent des cookies. Ces services nous aident avec l'analyse et la fonctionnalité. Leur utilisation des cookies est régie par leurs propres politiques de confidentialité." },
          { heading: "6. Contact", content: "Pour des questions sur notre utilisation des cookies, contactez : Responsable de la protection de la vie privée : Salah Taileb | Courriel : salah.taileb@Auralistech.ca" }
        ]
      },
      sale: {
        title: "Conditions de Vente",
        lastUpdated: "Dernière mise à jour : 10 Avril 2024",
        sections: [
          { heading: "1. Description du service", content: "app.AuraScribe.ca fournit des services d'assistance à la documentation médicale par IA. Des descriptions détaillées des services sont disponibles sur notre site web." },
          { heading: "2. Commande et paiement", content: "Les commandes sont passées via notre site web. Les prix sont en dollars canadiens sauf indication contraire. Le paiement est dû au moment de l'achat. Nous acceptons les cartes de crédit et autres modes de paiement sécurisés." },
          { heading: "3. Politique de remboursement", content: "Services d'abonnement : Annulation à tout moment ; pas de remboursement pour les périodes partielles. Services numériques : Remboursements disponibles dans les 14 jours si le service n'est pas fourni." },
          { heading: "4. Livraison du service", content: "Services numériques livrés via notre plateforme SaaS sécurisée. Délais de livraison spécifiés au moment de l'achat. Vous êtes responsable de fournir les informations nécessaires à la réalisation du service." },
          { heading: "5. Contenu de l'utilisateur", content: "Si vous fournissez du contenu pour nos services : Vous garantissez que vous possédez ou avez le droit d'utiliser le contenu. Nous pouvons utiliser des données anonymisées pour améliorer nos services. Vous conservez la propriété de votre contenu original." },
          { heading: "6. Limitation de responsabilité", content: "Notre responsabilité totale pour toute réclamation ne dépassera pas le montant payé pour le service spécifique ayant donné lieu à la réclamation." },
          { heading: "7. Résiliation", content: "Nous pouvons résilier les services si vous violez ces conditions. Vous pouvez résilier en cessant l'utilisation et en annulant tout abonnement." },
          { heading: "8. Protection du consommateur québécois", content: "Les résidents du Québec ont des droits supplémentaires en vertu de la Loi sur la protection du consommateur, notamment : Droit d'annuler certains contrats dans des délais spécifiques, Exigences de divulgation claire, Protection contre les clauses abusives." },
          { heading: "9. Contact", content: "Contact pour les demandes de vente : Salah Taileb | salah.taileb@auralistech.ca | 438-402-4751 | 3200 boulevard Cartier Ouest, Laval QC H7V 1J7, Canada" }
        ]
      },
      disclaimer: {
        title: "Avis de Non-Responsabilité",
        lastUpdated: "Dernière mise à jour : 10 Avril 2024",
        sections: [
          { heading: "Avis général", content: "Les informations sur app.AuraScribe.ca sont à titre informatif seulement. Nous ne faisons aucune déclaration ni garantie d'aucune sorte, expresse ou implicite, concernant l'exhaustivité, l'exactitude, la fiabilité, la pertinence ou la disponibilité des informations, produits, services ou graphiques connexes. Toute confiance que vous accordez à ces informations est strictement à vos propres risques." }
        ]
      }
    },
    trustCenter: {
      title: "Centre de Confiance",
      subtitle: "Transparence, Sécurité et Conformité pour la médecine moderne.",
      reportTitle: "Évaluation des Facteurs relatifs à la Vie Privée (EFVP)",
      date: "15 Mars 2024",
      sections: [
        {
          title: "1. Description du Projet",
          content: "AuraScribe est un assistant de documentation clinique SaaS conçu pour alléger la charge administrative des professionnels de la santé au Québec. Le système utilise l'IA générative pour effectuer la transcription en temps réel, la synthèse clinique et le formatage de la documentation (notes SOAP, codes de facturation RAMQ, formulaires MADO). Le système traite des renseignements personnels sensibles (informations de santé) et opère sur une base multimodale."
        },
        {
          title: "2. Flux des Renseignements Personnels",
          content: "Le cycle de vie des données est conçu pour minimiser la persistance. Les flux audio et vidéo sont capturés via l'API navigateur et chiffrés à la source (TLS 1.3). Les données sont transmises via WebSocket sécurisé directement à la région Montréal de Google Cloud (northamerica-northeast1). L'audio brut est éphémère et n'est pas persisté ; seule la note clinique structurée est conservée dans une base de données chiffrée (AES-256) accessible uniquement par le clinicien authentifié."
        },
        {
          title: "3. Conformité (Loi 25)",
          content: "Droit à l'explication (Art 12.1) : Un 'Badge de Transparence' indique quand l'IA écoute. Aucune décision n'est prise exclusivement par l'IA ; le médecin doit valider. Confidentialité par défaut (Art 9.1) : Utilisation de SubtleCrypto (AES-GCM 256-bit) pour sécuriser les données locales. Politique de zéro entraînement avec les fournisseurs de modèles."
        },
        {
          title: "4. Analyse de Risque & Atténuation",
          content: "Risque d'hallucination du modèle : Atténué par une architecture 'Human-in-the-Loop' obligeant la révision avant export vers le DMÉ. Accès non autorisé : Atténué par délais d'expiration de session, MFA et chiffrement local. Enregistrement sans consentement : Contrôles procéduraux et indicateurs visuels clairs."
        },
        {
          title: "5. Évaluation Transfrontalière",
          content: "Toutes les données résident au Québec. Bien que l'infrastructure soit fournie par Google (entité US), une entente BAA est signée, les clés de chiffrement sont gérées par AuraScribe, et l'environnement est certifié ISO 27001/SOC 2 Type II, assurant une protection équivalente aux normes québécoises."
        }
      ]
    },
    footer: {
      tagline: 'Autonomiser les cliniciens canadiens avec une documentation sécurisée par IA.',
      product: 'Produit',
      legal: 'Légal',
      connect: 'Connexion',
      rights: 'Tous droits réservés.',
      status: 'Système Opérationnel'
    },
    common: {
      skipToContent: 'Aller au contenu principal',
      loading: 'Chargement...',
      pageTitle: 'AuraScribe | Scribe médical IA pour le Canada',
      articleNotFound: 'Article non trouvé | AuraScribe',
      pageNotFound: 'Page non trouvée | AuraScribe',
      notFoundTitle: 'Page non trouvée',
      notFoundDescription: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
      returnHome: 'Retour à l\'accueil'
    }
  },
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How it Works',
      compliance: 'Compliance',
      pricing: 'Pricing',
      faq: 'FAQ',
      blog: 'Blog',
      contact: 'Contact',
      login: 'Login',
      startTrial: 'Start Free Trial',
    },
    hero: {
      newBadge: 'New: Visual Evidence Agent',
      headline: 'Focus on the patient,',
      headlineHighlight: 'not the paperwork.',
      subhead: 'The AI Medical Scribe that goes beyond expectations. Generate notes, prescriptions, lab orders, referrals, patient notes, RAMQ billing, and MADO forms in seconds.',
      cta: 'Start 14-Day Free Trial',
      noCard: 'No credit card required',
      compliance: 'Compliant with Quebec Law 25 & HIPAA',
      dataResidency: 'Data resides in Montreal (GCP)',
      stats: {
        time: 'Save 2 hours of charting / day',
        residency: '100% Montreal Data Residency',
        specialties: '15+ Medical Specialties Supported',
      }
    },
    coreTech: {
      title: 'The Intelligent Clinical Engine',
      subtitle: 'A complex neural architecture that transforms voice into structured medical data.',
      nodes: {
        transcripts: 'Smart Transcripts',
        topics: 'Topic Detection',
        formatting: 'Smart Formatting',
        intent: 'Intent Detection',
        sentiment: 'Sentiment Analysis',
        model: 'Clinical Model'
      }
    },
    integrations: {
      title: 'Fits your clinical ecosystem',
      subtitle: 'Direct synchronization with major Canadian EMRs and fax services.'
    },
    video: {
      title: 'Experience the Platform',
      subtitle: 'Watch how AuraScribe transforms a typical patient encounter in less than 2 minutes.',
    },
    demo: {
      title: 'See AuraScribe in Action',
      subtitle: 'Simulate a patient encounter (Audio) or analysis of clinical imagery (Visual).',
      modes: {
        audio: 'Audio Scribe',
        visual: 'Visual Agent'
      },
      inputTitle: 'Live Transcription',
      visualInputTitle: 'Visual Evidence Analysis',
      outputTitle: 'Generated Note (SOAP)',
      visualOutputTitle: 'Dermatological Report',
      btnRecord: 'Simulate Recording',
      btnScan: 'Analyze Image',
      btnProcessing: 'Extracting Medical Entities...',
      btnAnalyzing: 'Scanning Lesions...',
      btnReset: 'Reset Simulation',
      rawTranscript: "Patient reports chronic fatigue and joint pain. Prescription for 5mg needed. Physical exam was normal. The patient is advised to take 5mg daily. Follow up in one month.",
      processingSteps: {
        listening: 'Listening...',
        analyzing: 'Clinical Analysis...',
        structuring: 'Formatting SOAP...'
      },
      generatedSoap: {
        s: "Patient reports chronic fatigue and joint pain. Reports needing 5mg prescription.",
        o: "Physical exam normal.",
        a: "Chronic fatigue / Joint pain.",
        p: "Prescription: 5mg daily. Follow-up in 1 month."
      },
      visualAnalysis: {
        findings: "Well-demarcated erythematous plaque with silvery scale on extensor surface of elbow.",
        diagnosis: "Plaque Psoriasis (Psoriasis Vulgaris).",
        confidence: "98.4%",
        recommendation: "Topical corticosteroids (e.g., betamethasone) and vitamin D analogues."
      },
      transparency: {
        title: "Logic Transparency (Art 12.1 Compliance)",
        parameters: "Parameters: Physician Dictation; Guidelines: ICD-10-CA.",
        reasoning: "Reasoning: Structured synthesis based on encounter highlights.",
        disclaimer: "DISCLAIMER: This output is AI-generated and must be reviewed by a human professional.",
        confidenceLabel: "Completeness Score: High",
        insufficient: "Information insufficient for [X]; please provide clinical clarification."
      }
    },
    howItWorks: {
      title: 'How It Works',
      subtitle: 'Your clinical assistant in 4 simple steps.',
      steps: [
        { title: 'Record', desc: 'Start the secure recording at the beginning of the encounter.' },
        { title: 'AI Analyzes', desc: 'AuraScribe transcribes and structures medical data instantly.' },
        { title: 'Review', desc: 'Validate generated documents (Notes, Rx, Lab Orders, Referrals) and add visual observations.' },
        { title: 'Integrate', desc: 'Export directly to Omnimed, TELUS, or MYLE in one click.' }
      ]
    },
    features: {
      title: 'Not just a scribe.',
      subtitle: 'AuraScribe generates everything: Clinical Notes, Prescriptions, Lab Orders, Referrals, Patient Notes, and more.',
      items: [
        { title: 'Complete Documentation', desc: 'Go beyond the note. Automatically generate prescriptions, lab requisitions, referral letters, and patient instructions.' },
        { title: 'Bilingual Clinical Brain', desc: 'Built for the Quebec medical landscape. Transcribe in French or English; output perfect documents in either language.' },
        { title: 'Multi-Agent Ecosystem', desc: 'Not just a generic AI. A team of specialists: Clinical Agent, Research Agent, and Visual Agent working at your side.' },
        { title: 'Quebec Law 25 & HIPAA', desc: 'Your data stays in Montreal. Fully compliant with Quebec Law 25. Automated audit logging for total peace of mind.' },
        { title: 'Auto Forms (MADO & RAMQ)', desc: 'Automate the painful stuff. Auto-fill MADO forms and capture every RAMQ billing opportunity without lifting a pen.' },
        { title: 'Secure AuraLink™ Sharing', desc: 'Share prescriptions and instructions safely with patients via encrypted, time-limited links. No insecure emails.' },
        { title: 'EMR & E-Fax Direct Sync', desc: 'Plugs into your workflow. One-click sync to Omnimed and TELUS. Fax prescriptions directly via integrated SRFax.' },
        { title: 'Voice-First Flexibility', desc: 'Works where you work. In-person consults, direct dictation, or Telehealth sessions—AuraScribe hears it all with precision.' }
      ]
    },
    testimonials: {
      title: 'Trusted by local clinicians',
      subtitle: 'Join hundreds of doctors saving 2 hours every day.',
      items: [
        { quote: "Finally a tool that understands Montreal 'Franglais'. My notes are done before the patient leaves the room.", author: "Dr. Tremblay", role: "Cardiologist", location: "CHUM, Montreal" },
        { quote: "Law 25 compliance was my priority. Local hosting and the signed BAA convinced me.", author: "Dr. Nguyen", role: "Family Physician", location: "Private Clinic, Quebec" },
        { quote: "I no longer spend my evenings doing paperwork. It's a complete life changer.", author: "Dr. Smith", role: "Pediatrician", location: "Gatineau" }
      ]
    },
    compliance: {
      tag: 'Security First',
      title: 'Enterprise-grade security.',
      titleHighlight: 'Law 25 Compliant.',
      description: 'Patient trust is your currency. We built AuraScribe with a security-first architecture that exceeds Canadian regulatory standards.',
      items: [
        { title: 'GCP Montreal Region', desc: 'All data is processed and stored exclusively within Google Cloud Platform\'s Montreal region (northamerica-northeast1).' },
        { title: 'Art. 12.1 Transparency', desc: 'We proactively inform users when clinical notes are drafted via automated processing. All AI output requires physician validation.' },
        { title: 'End-to-End Encryption', desc: 'Data is encrypted in transit and at rest (AES-256). Strict Law 25 compliant audit logs maintained.' },
        { title: 'Standard of Care Framework', desc: 'AuraScribe operates as a decision-support tool. Final diagnosis and clinical decisions remain the sole responsibility of the licensed professional.' }
      ],
      sovereign: 'Data Sovereignty',
      sovereignDesc: 'Your data never leaves Canadian soil.'
    },
    pricing: {
      title: 'Simple, transparent pricing',
      subtitle: 'Start with a free trial. Upgrade when you see the value.',
      mostPopular: 'Most Popular',
      tiers: [
        { name: 'Free Trial', price: '$0', desc: 'Experience the power of AuraScribe risk-free.', cta: 'Start Free Trial', features: ['14-Day Access', 'Unlimited Notes', 'All Specialty Agents', 'No Credit Card Required'] },
        { name: 'Pro Plan', price: '$99', desc: 'For individual clinicians seeking efficiency.', cta: 'Get Started', features: ['Unlimited Notes', 'Bilingual Support', 'Visual Evidence Analysis', 'EMR Integration Support', 'Priority Email Support'] },
        { name: 'Clinic Plan', price: 'Custom', desc: 'For clinics with 5+ providers.', cta: 'Contact Sales', features: ['Everything in Pro', 'Centralized Billing', 'Admin Dashboard', 'Dedicated Onboarding', 'Custom BAA'] }
      ]
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Question? Our Montreal-based team is here to help.',
      infoTitle: 'Get in Touch',
      formTitle: 'Send us a message',
      phiWarning: 'WARNING: Do not include Protected Health Information (RAMQ numbers, patient names, health history) in this form. Use the secure portal for clinical support.',
      labels: {
        name: 'Full Name',
        email: 'Email Address',
        subject: 'Subject',
        message: 'Message',
        submit: 'Send Message',
        sending: 'Sending...',
        success: 'Message sent successfully!',
        privacyConsent: "I agree to the processing of my data in accordance with the Privacy Policy."
      },
      details: {
        email: 'contact@app.aurascribe.ca',
        phone: '(438) 402-4751',
        address: '3200 Boulevard Cartier Ouest, Laval, QC H7V 1J7'
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know before modernizing your practice.",
      items: [
        { q: "Is it compatible with my EMR?", a: "Yes, AuraScribe integrates directly with Omnimed, TELUS (PS Suite, Medesync), and MYLE. For others, we offer a smart copy-paste feature." },
        { q: "Is my data secure?", a: "Absolutely. Your data is end-to-end encrypted (AES-256) and stored exclusively in Canada (Google Cloud's Montreal region), fully compliant with Law 25 and PIPEDA." },
        { q: "Does the AI understand Quebec accents?", a: "Yes. Our model has been specifically trained on thousands of hours of medical dialogues in Quebec French and Montreal 'Franglais' to ensure maximum accuracy." },
        { q: "Can I cancel anytime?", a: "Yes, our plans are monthly with no long-term commitment. You can cancel your subscription directly from your dashboard without penalty." },
        { q: "Does the AI record the conversation?", a: "Audio is processed in real-time to generate the note, then immediately deleted from our servers once the transcription is validated, unless you explicitly choose to keep it for your records." }
      ]
    },
    blog: {
      title: 'Clinical Insights',
      subtitle: 'Reflections on the future of medicine, AI, and administrative efficiency.',
      readMore: 'Read more',
      searchPlaceholder: 'Search articles...',
      subscribeTitle: "Stay in the loop",
      subscribeDesc: "Get the latest updates on medical AI and product features directly in your inbox.",
      subscribeBtn: "Subscribe",
      emailPlaceholder: "your@email.com",
      categories: {
        all: 'All'
      },
      posts: [
        {
          slug: "first-sacrifice-your-time",
          title: "The First Sacrifice: Your Time",
          category: "Burnout",
          excerpt: "Tool fragmentation imposes cognitive load and slows down every action. Discover how administrative overload leads to burnout.",
          content: `
            <p class="lead">Modern medicine is in crisis. Not from a lack of knowledge or treatments, but from a lack of time.</p>
            <p>Every day, a physician spends on average 2 to 3 hours on clinical documentation. This "invisible work" piles up, eating into evenings, weekends, and ultimately, the quality of life of practitioners. The phenomenon has a name: "administrative burden".</p>
            <h3>The fragmentation of attention</h3>
            <p>Electronic Medical Records (EMRs) promised efficiency. In reality, they have turned doctors into data entry clerks. Instead of looking the patient in the eye, eyes are glued to the screen, navigating through drop-down menus and checkboxes.</p>
            <p>This fragmentation of attention comes at a high cognitive cost. The human brain is not built for the intense multitasking required by modern consultation: listening, analyzing, diagnosing, empathizing, and documenting simultaneously.</p>
            <h3>AI as the remedy</h3>
            <p>This is where artificial intelligence comes in. Not to replace the doctor, but to liberate them. By automating the capture and structuring of data, tools like AuraScribe give the doctor back their most precious resource: their full and undivided attention.</p>
            <p>Imagine a consultation where the computer fades into the background. Where technology becomes invisible. This is the promise of ethical and well-designed AI.</p>
          `,
          date: "Mar 12, 2024",
          readTime: "3 min read"
        },
        {
          slug: "symphony-intelligent-agents",
          title: "A Symphony of Intelligent Agents",
          category: "Medical AI",
          excerpt: "AuraScribe is not a single tool, but a symphony of specialized agents collaborating to execute your administrative score.",
          content: `
            <p class="lead">Generative artificial intelligence has taken a spectacular leap forward. But a single model, no matter how powerful, cannot do everything perfectly.</p>
            <p>In medicine, precision is non-negotiable. A model excellent at writing an empathetic letter might be mediocre at coding complex billing. That's why we adopted a multi-agent approach.</p>
            <h3>The Clinical Agent</h3>
            <p>Specialized in medical terminology, it listens to the conversation and extracts symptoms, history, and physical observations. It structures this information into standardized SOAP format.</p>
            <h3>The Administrative Agent</h3>
            <p>It works in parallel to identify billing codes, fill out forms, and prepare lab requisitions. It knows the billing rules inside out and misses no opportunity.</p>
            <h3>The Research Agent</h3>
            <p>It checks for drug interactions and suggests referrals based on the latest clinical guidelines. It's an extra safety net operating in the background.</p>
            <p>Together, these agents form an invisible but omnipresent team, transforming AuraScribe into much more than a simple dictation tool.</p>
          `,
          date: "Mar 5, 2024",
          readTime: "5 min read"
        },
        {
          slug: "one-conversation-three-actions",
          title: "From One Conversation to Three Actions",
          category: "Efficiency",
          excerpt: "Structured consultation notes, pre-filled forms, and secure prescriptions: all generated automatically from a simple conversation.",
          content: `
            <p class="lead">Clinical efficiency is not measured by the number of patients seen, but by the quality of the interaction and the fluidity of the process.</p>
            <p>Traditionally, a 15-minute consultation generates 10 minutes of subsequent administrative work. Writing the note, printing the prescription, sending the fax to the pharmacy, writing the referral...</p>
            <h3>The unified workflow</h3>
            <p>With AuraScribe, voice becomes the single interface. A simple voice instruction during the consultation ("I'm going to prescribe Amoxicillin 500mg for 7 days") triggers a cascade of digital actions.</p>
            <ol>
              <li>The prescription is drafted and ready to be signed.</li>
              <li>The chart note is updated with the treatment plan.</li>
              <li>The patient receives intake instructions via a secure link.</li>
            </ol>
            <p>This paradigm shift allows closing the file 30 seconds after the patient leaves, rather than at the end of the day.</p>
          `,
          date: "Feb 28, 2024",
          readTime: "4 min read"
        }
      ]
    },
    legal: {
      privacy: {
        title: "Privacy Policy",
        lastUpdated: "Last Updated: April 10, 2024",
        sections: [
          { heading: "1. Introduction", content: "app.AuraScribe.ca (\"we,\" \"our,\" or \"us\") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website app.AuraScribe.ca." },
          { heading: "2. Information We Collect", content: "We may collect personal information that you voluntarily provide to us, including: Contact information (name, email address, phone number), Billing information, Communications you send to us, Usage data and analytics." },
          { heading: "3. How We Use Your Information", content: "We use the information we collect to: Provide, operate, and maintain our services, Process your transactions, Communicate with you, Improve our website and services, Comply with legal obligations." },
          { heading: "4. Sharing Your Information", content: "We do not sell your personal information. We may share information: With service providers who assist our operations, To comply with legal requirements, With your consent." },
          { heading: "5. Data Security", content: "We implement reasonable security measures to protect your personal information. However, no electronic transmission or storage is 100% secure." },
          { heading: "6. Your Rights", content: "Under Canadian privacy laws, you have rights to: Access your personal information, Correct inaccurate information, Withdraw consent (with legal or contractual restrictions), Lodge complaints with the Privacy Commissioner of Canada." },
          { heading: "7. Contact Information", content: "Privacy Officer: Salah Taileb | Email: salah.taileb@auralistech.ca | Phone: 438-402-4751 | Address: 3200 boulevard Cartier Ouest, Laval QC H7V 1J7, Canada" },
          { heading: "8. Changes to This Policy", content: "We may update this policy periodically. The updated version will be posted on our website." }
        ]
      },
      terms: {
        title: "Terms of Use",
        lastUpdated: "Last Updated: April 10, 2024",
        sections: [
          { heading: "1. Acceptance of Terms", content: "By accessing and using app.AuraScribe.ca, you accept and agree to be bound by these Terms of Use." },
          { heading: "2. Use License", content: "We grant you a limited, non-exclusive, non-transferable license to use our website for personal or business purposes as intended." },
          { heading: "3. User Responsibilities", content: "You agree to: Provide accurate information, Not use the site for illegal purposes, Not interfere with site security or functionality." },
          { heading: "4. Intellectual Property", content: "All content on app.AuraScribe.ca is our property or licensed to us and protected by copyright and intellectual property laws." },
          { heading: "5. Limitation of Liability", content: "To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website." },
          { heading: "6. Governing Law", content: "These Terms are governed by the laws of Quebec and Canada. Any disputes shall be subject to the exclusive jurisdiction of the courts of Quebec." },
          { heading: "7. Modifications", content: "We reserve the right to modify these Terms at any time. Continued use constitutes acceptance of changes." },
          { heading: "8. Contact", content: "For questions about these Terms, contact: Salah Taileb | salah.taileb@auralistech.ca | 438-402-4751 | 3200 boulevard Cartier Ouest, Laval QC H7V 1J7, Canada" }
        ]
      },
      cookies: {
        title: "Cookie Policy",
        lastUpdated: "Last Updated: April 10, 2024",
        sections: [
          { heading: "1. What Are Cookies", content: "Cookies are small text files stored on your device when you visit websites. They help websites function properly and provide information to website owners." },
          { heading: "2. How We Use Cookies", content: "app.AuraScribe.ca uses cookies to: Ensure proper website functionality, Remember your preferences, Analyze website traffic and usage, Improve user experience." },
          { heading: "3. Types of Cookies We Use", content: "Essential Cookies: Required for basic website functionality. Analytics Cookies: Help us understand how visitors interact with our site. Preference Cookies: Remember your settings and preferences." },
          { heading: "4. Your Cookie Choices", content: "You can control cookies through your browser settings. Most browsers allow you to: See what cookies are stored, Delete individual or all cookies, Block cookies from specific sites or all sites, Set preferences for different types." },
          { heading: "5. Third-Party Cookies", content: "We may use third-party services that place cookies. These services help us with analytics and functionality. Their use is governed by their own privacy policies." },
          { heading: "6. Contact", content: "For questions about our use of cookies, contact: Privacy Officer: Salah Taileb | Email: salah.taileb@Auralistech.ca" }
        ]
      },
      sale: {
        title: "Terms of Sale",
        lastUpdated: "Last Updated: April 10, 2024",
        sections: [
          { heading: "1. Service Description", content: "app.AuraScribe.ca provides AI-driven clinical documentation assistance services. Detailed service descriptions are available on our website." },
          { heading: "2. Ordering and Payment", content: "Orders are placed through our website. Prices are in Canadian dollars unless otherwise specified. Payment is due at time of purchase. We accept major credit cards and other secure methods." },
          { heading: "3. Refund Policy", content: "Subscription services: May cancel anytime; no refunds for partial periods. Digital services: Refunds available within 14 days if service not rendered." },
          { heading: "4. Service Delivery", content: "Digital services delivered via our secure SaaS platform. Delivery timelines specified at time of purchase. You are responsible for providing necessary info for service completion." },
          { heading: "5. User Content", content: "If you provide content for our services: You warrant you own or have rights to use the content. We may use anonymized data to improve our services. You retain ownership of your original content." },
          { heading: "6. Limitation of Liability", content: "Our total liability for any claim shall not exceed the amount paid for the specific service giving rise to the claim." },
          { heading: "7. Termination", content: "We may terminate services if you violate these terms. You may terminate by ceasing use and canceling any subscriptions." },
          { heading: "8. Quebec Consumer Protection", content: "Quebec residents have additional rights under the Consumer Protection Act, including: Right to cancel certain contracts within specific timeframes, Clear disclosure requirements, Protection against abusive clauses." },
          { heading: "9. Contact", content: "Contact for Sales Inquiries: Salah Taileb | salah.taileb@auralistech.ca | 438-402-4751 | 3200 boulevard Cartier Ouest, Laval QC H7V 1J7, Canada" }
        ]
      },
      disclaimer: {
        title: "Disclaimer",
        lastUpdated: "Last Updated: April 10, 2024",
        sections: [
          { heading: "General Disclaimer", content: "The information on app.AuraScribe.ca is for general informational purposes only. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics. Any reliance you place on such information is strictly at your own risk." }
        ]
      }
    },
    trustCenter: {
      title: "Trust Center",
      subtitle: "Transparency, Security, and Compliance for modern medicine.",
      reportTitle: "Privacy Impact Assessment (PIA)",
      date: "March 15, 2024",
      sections: [
        {
          title: "1. Project Description",
          content: "AuraScribe is a SaaS-based clinical documentation assistant designed to alleviate administrative burden for Quebec healthcare professionals. The system utilizes Generative AI to perform real-time transcription, clinical synthesis, and documentation formatting (SOAP notes, RAMQ billing codes, MADO forms). The system handles Sensitive Personal Information (Health Information) and operates on a multimodal basis."
        },
        {
          title: "2. Personal Information Flow",
          content: "The data lifecycle is architected to minimize persistence. Audio/Video streams are captured via browser API and encrypted at source (TLS 1.3). Data is transmitted via secure WebSocket directly to Google Cloud's Montreal Region (northamerica-northeast1). Raw audio is ephemeral and not persisted; only structured clinical notes are retained in an encrypted SQL database (AES-256) accessible only by the authenticated clinician."
        },
        {
          title: "3. Compliance Assessment (Law 25)",
          content: "Right to Explanation (Art 12.1): A 'Transparency Badge' indicates when AI is listening. No decision is made exclusively by AI; the physician must validate. Confidentiality by Default (Art 9.1) : Uses SubtleCrypto (AES-GCM 256-bit) for local data. Zero-training policy with model providers."
        },
        {
          title: "4. Risk Analysis & Mitigation",
          content: "Model Hallucination Risk: Mitigated by 'Human-in-the-Loop' architecture forcing review before EMR export. Unauthorized Access: Mitigated by session timeouts, MFA, and local encryption. Recording without Consent: Procedural controls and clear visual indicators."
        },
        {
          title: "5. Cross-Border Assessment",
          content: "All data resides in Quebec. While infrastructure is provided by Google (US entity), a BAA is signed, encryption keys are managed by AuraScribe, and the environment holds ISO 27001/SOC 2 Type II certifications, ensuring equivalent protection."
        }
      ]
    },
    footer: {
      tagline: 'Empowering Canadian clinicians with secure, AI-driven documentation.',
      product: 'Product',
      legal: 'Legal',
      connect: 'Connect',
      rights: 'All rights reserved.',
      status: 'System Operational'
    },
    common: {
      skipToContent: 'Skip to main content',
      loading: 'Loading...',
      pageTitle: 'AuraScribe | AI Medical Scribe for Canada',
      articleNotFound: 'Article Not Found | AuraScribe',
      pageNotFound: 'Page Not Found | AuraScribe',
      notFoundTitle: 'Page Not Found',
      notFoundDescription: 'The page you are looking for does not exist or has been moved.',
      returnHome: 'Return Home'
    }
  }
};
