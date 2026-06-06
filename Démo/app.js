/* ============================================================
   X-plorer — DÉMO : écrans + navigation (vanilla)
   Reproduit fidèlement le flow du prototype, pré-rempli avec le persona Léa.
   Welcome → Quiz → Résultats → App (Score / Plan / Expériences / Profil)
   ============================================================ */
(function () {
  "use strict";
  const { computeScore, getRecos, rankExperiences, isPartnered } = window.XEngine;
  const persona = window.XPersona;
  const icon = window.XIcon;
  const root = document.getElementById("app");
  const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* ============================================================
     QUIZ — structure portée de src/app/onboarding/page.tsx
     ============================================================ */
  const IN_COUPLE = (a) =>
    /couple|mari|pacs|relation libre/i.test(a.relationship || "");
  const PRIVACY_OPT = "Préfère ne pas dire";

  const QUIZ = [
    { kind: "section", id: "s1", title: "Toi", subtitle: "Quelques infos pour qu'on se connaisse mieux." },
    { kind: "single", id: "age", q: "Quel âge as-tu ?", opts: ["18–24", "25–34", "35–44", "45–54", "55+"] },
    { kind: "single", id: "gender", q: "Comment t'identifies-tu ?", opts: ["Femme", "Homme", "Non-binaire", "Autre"] },
    { kind: "single", id: "relationship", q: "Quelle est ta situation amoureuse ?", opts: ["Célibataire", "En rencontres", "En couple (non-cohabitant)", "En couple", "Marié·e / pacsé·e", "Relation libre", "C'est compliqué"] },
    { kind: "single", id: "relationshipDuration", q: "Depuis combien de temps êtes-vous ensemble ?", opts: ["Moins d'1 an", "1 à 3 ans", "3 à 7 ans", "Plus de 7 ans"], showIf: IN_COUPLE },
    { kind: "multi", id: "lifeContext", q: "Y a-t-il quelque chose qui prend beaucoup d'espace en ce moment ?", hint: "Plusieurs réponses possibles", opts: ["Travail intense", "Enfants en bas âge", "Démarches administratives", "Problèmes de santé", "Déménagement / changement", "Rien de particulier"] },

    { kind: "section", id: "s2", title: "Ton quotidien", subtitle: "On creuse ce qui se passe dans ta semaine type." },
    { kind: "single", id: "globalMood", q: "Comment te sens-tu globalement en ce moment ?", opts: ["Épuisé·e émotionnellement", "Tendu·e mais je tiens", "Plutôt stable", "Plein·e d'élan"] },
    { kind: "single", id: "stressSource", q: "Quelle est ta principale source de stress ?", opts: ["Travail", "Famille", "Finances", "Santé", "Couple", "Plusieurs choses à la fois", "Aucune particulière"] },
    { kind: "single", id: "sleepQuality", q: "Comment décrirais-tu ton sommeil ?", opts: ["Réparateur la plupart du temps", "Correct mais perfectible", "Léger / irrégulier", "Mauvais — je me réveille épuisé·e"] },
    { kind: "single", id: "bedtime", q: "À quelle heure te couches-tu en semaine ?", opts: ["Avant 22h", "22h – 23h", "23h – minuit", "Après minuit"] },
    { kind: "single", id: "screenEvening", q: "Tu utilises ton téléphone juste avant de dormir ?", opts: ["Jamais (livre, calme)", "Parfois", "Souvent", "Toutes les nuits, jusqu'à m'endormir"] },
    { kind: "single", id: "eveningEnergy", q: "À quelle fréquence te sens-tu épuisé·e en fin de journée ?", opts: ["Tous les jours", "Souvent (4–5 jours/semaine)", "Parfois (1–3 jours/semaine)", "Rarement"] },

    { kind: "section", id: "s3", title: "Ton intimité", subtitle: "Réponds avec ce que tu ressens, pas ce qui 'devrait' être." },
    { kind: "single", id: "currentDesire", q: "Ces dernières semaines, comment décrirais-tu ton désir ?", opts: ["Absent", "Faible", "Variable", "Présent", "Très présent"] },
    { kind: "single", id: "desireGap", q: "Ton désir et celui de ton/ta partenaire sont alignés ?", opts: ["Oui, plutôt", "Pas vraiment", "Non, gros écart", "Je ne sais pas"], showIf: IN_COUPLE },
    { kind: "single", id: "initiation", q: "Qui initie le plus l'intimité dans ton couple ?", opts: ["Moi presque toujours", "Plus souvent moi", "Autant l'un que l'autre", "Plus souvent mon/ma partenaire", "Plus personne ne le fait beaucoup"], showIf: IN_COUPLE },
    { kind: "single", id: "communication", q: "Tu parles de tes envies et limites avec ton/ta partenaire ?", opts: ["Souvent", "Parfois", "Rarement", "Jamais"], showIf: IN_COUPLE },
    { kind: "single", id: "mainBarrier", q: "Qu'est-ce qui freine le plus ton intimité actuellement ?", opts: ["Fatigue physique", "Stress et charge mentale", "Tensions dans le couple", "Image de mon corps", "Anxiété de performance", "Manque de désir tout court", "Manque de temps", "Autre"] },

    { kind: "section", id: "s4", title: "Pour aller plus loin", subtitle: "Cette section nous aide à affiner l'analyse — tu peux la passer complètement.", optional: true },
    { kind: "single", id: "lifeEvent", q: "Un évènement de vie récent a-t-il impacté ton intimité ?", privacy: true, opts: ["Aucun", "Naissance d'un enfant", "Séparation / rupture", "Deuil", "Maladie / accident", "Burnout", "Autre"] },
    { kind: "single", id: "therapySupport", q: "Tu es actuellement accompagné·e par un·e thérapeute ?", privacy: true, opts: ["Oui", "Non", "Plus maintenant"] },
    { kind: "single", id: "medication", q: "Tu prends un traitement qui peut affecter le désir ?", hint: "Antidépresseurs, contraception hormonale, hormonothérapie, etc.", privacy: true, opts: ["Oui", "Non", "Je ne sais pas"] },

    { kind: "section", id: "s5", title: "Ton objectif", subtitle: "Dernière étape — où veux-tu aller ?" },
    { kind: "single", id: "goal", q: "Quel est ton objectif principal en venant ici ?", opts: ["Comprendre ce qui bloque", "Réduire l'anxiété de performance", "Reconnecter avec mon/ma partenaire", "Améliorer mon sommeil", "Retrouver mon énergie", "Explorer ma sexualité", "Mieux communiquer en couple"] },
    { kind: "single", id: "vision", q: "Si tout se passait bien, qu'est-ce qui aurait changé dans 3 mois ?", opts: ["Je dors mieux et j'ai plus d'énergie", "J'ai retrouvé du désir", "Je me sens moins anxieux·se", "Notre couple est plus connecté", "Je m'accepte plus", "Je ne sais pas encore"] },
  ];

  function deriveIntakeFromQuiz(a) {
    const eveningMap = { "Tous les jours": 2, "Souvent (4–5 jours/semaine)": 4, "Parfois (1–3 jours/semaine)": 6, Rarement: 8 };
    const sleepMap = { "Réparateur la plupart du temps": 8, "Correct mais perfectible": 6, "Léger / irrégulier": 4, "Mauvais — je me réveille épuisé·e": 2 };
    const e1 = eveningMap[a.eveningEnergy || ""] ?? 5;
    const e2 = sleepMap[a.sleepQuality || ""] ?? 5;
    const energy = Math.round((e1 + e2) / 2);
    const desireMap = { Absent: 1, Faible: 3, Variable: 5, Présent: 7, "Très présent": 9 };
    const desire = desireMap[a.currentDesire || ""] ?? 5;
    const moodMap = { "Épuisé·e émotionnellement": 2, "Tendu·e mais je tiens": 4, "Plutôt stable": 7, "Plein·e d'élan": 9 };
    const zen = moodMap[a.globalMood || ""] ?? 5;
    return { zen, energy, desire };
  }

  function mergedIntake(quiz) {
    const d = deriveIntakeFromQuiz(quiz);
    return {
      zen: d.zen, energy: d.energy, desire: d.desire,
      stressLevel: quiz.globalMood || quiz.stress,
      sleep: quiz.sleepQuality || quiz.sleep,
    };
  }

  /* narrative — miroir de fallbackNarrative (api/analysis/route.ts) */
  function narrativeFor(intake, quiz) {
    const lowest = Math.min(intake.energy, intake.desire, intake.zen);
    const isLowZen = lowest === intake.zen;
    const isLowEnergy = lowest === intake.energy;
    const partnered = /en couple|mari[ée]|pacs|relation libre/i.test(quiz.relationship || "");
    if (isLowZen) {
      return {
        constat: `Tu te sens "${quiz.globalMood || "tendu·e"}" et ta principale source de stress est "${quiz.stressSource || "le travail"}". ${quiz.mainBarrier ? `Le frein principal que tu identifies est "${quiz.mainBarrier}".` : ""}`,
        hypothese: "Le cortisol — hormone du stress — supprime activement la production de testostérone et bloque la dopamine. Tant que ton système nerveux reste en mode 'alerte', le désir et la récupération sont en compétition perdue avec la vigilance.",
        levier: "Couper le cycle de stress chaque jour, à heure fixe, est la priorité absolue. C'est le seul levier qui agit en cascade sur le sommeil, l'énergie et le désir.",
        programme: ["Semaine 1 — Désamorçage du stress quotidien", "Semaine 2 — Hygiène de sommeil renforcée", "Semaine 3 — Reconnexion aux sensations", partnered ? "Semaine 4 — Rituels d'intimité partagés" : "Semaine 4 — Exploration sensorielle solo"],
      };
    }
    if (isLowEnergy) {
      return {
        constat: `Tu décris ton sommeil comme "${quiz.sleepQuality || "léger"}", tu te couches "${quiz.bedtime || "après minuit"}" et tu te sens épuisé·e "${quiz.eveningEnergy || "souvent"}" en fin de journée.`,
        hypothese: "Sans phase de sommeil profond suffisante, ta sécrétion hormonale nocturne (testostérone, GH) est tronquée. Tu démarres chaque journée avec un déficit que la caféine ne comble pas — et le désir, qui demande une énergie disponible, passe en dernier.",
        levier: "Restaurer un sommeil de qualité est le levier dominant. C'est la base sur laquelle se construit tout le reste : énergie, gestion du stress, libido.",
        programme: ["Semaine 1 — Hygiène de sommeil stricte", "Semaine 2 — Récupération diurne (NSDR, marche)", "Semaine 3 — Désamorçage du stress résiduel", "Semaine 4 — Reconnexion sensorielle"],
      };
    }
    return {
      constat: `Ton désir actuel se présente "${quiz.currentDesire || "faible"}". ${quiz.mainBarrier ? `Tu identifies "${quiz.mainBarrier}" comme frein principal.` : ""}`,
      hypothese: "Le désir n'est pas un robinet — c'est une réponse à un environnement. Quand le corps lutte contre le stress, le sommeil ou les tensions, il bascule en mode économie d'énergie et coupe les fonctions 'non-vitales'.",
      levier: "Identifier ce qui prend l'espace dans ta tête et l'évacuer avant le coucher est le levier principal. Le désir suit, il ne précède pas.",
      programme: ["Semaine 1 — Identifier les charges mentales", "Semaine 2 — Rituels de transition (boulot → maison)", partnered ? "Semaine 3 — Sensate Focus avec ton/ta partenaire" : "Semaine 3 — Auto-toucher mindful & body scan", partnered ? "Semaine 4 — Communication des envies en couple" : "Semaine 4 — Clarifier tes envies et limites"],
    };
  }

  /* ============================================================
     PLAN_DATA — porté de src/app/(app)/plan/page.tsx
     ============================================================ */
  const PLAN_DATA = {
    Psychologie: {
      habits: [
        { id: "p1", title: "Pratiquer 10 min de cohérence cardiaque", sub: "Réduit le cortisol et l'anxiété de performance." },
        { id: "p2", title: "Déconnecter des écrans 1h avant le coucher", sub: "Favorise la production de mélatonine." },
        { id: "p3", title: "Exercice de gratitude relationnelle", sub: "Noter une chose appréciée chez ton/ta partenaire.", couple: true, soloAlt: { title: "Journal de gratitude personnelle", sub: "Noter 3 choses appréciées chez toi ou dans ta journée." } },
      ],
      insights: [
        { id: "i1", icon: "wave", color: "#B21D27", title: "Désamorcer l'anxiété de performance", sub: "Comprendre le lien entre stress et blocages.", explanation: "En période de stress, le corps sécrète du cortisol — qui inhibe la production de testostérone et de dopamine, essentielles au désir. Le cerveau reste en mode \"alerte\", rendant le lâcher-prise difficile.", actions: ["La technique du SAS — créer une transition claire de 20 min entre travail et vie perso (douche, marche, méditation).", "Sensate Focus — pratiquer le toucher non-exigeant avec ton/ta partenaire, sans objectif de performance."], soloAlt: { title: "Désamorcer l'anxiété de performance", sub: "Détendre le corps avant qu'il ne se contracte.", explanation: "En période de stress, le cortisol inhibe testostérone et dopamine. Le corps se met en mode \"alerte\" et coupe les sensations de plaisir. Apprendre à le détendre seul·e est la base.", actions: ["La technique du SAS — 20 min de transition entre travail et vie perso (douche, marche, méditation).", "Self-massage / auto-toucher mindful — explorer tes sensations sans objectif, 10 min, en pleine conscience."] } },
        { id: "i2", icon: "heart", color: "#B21D27", title: "Reconstruire l'intimité émotionnelle", sub: "Exercices de communication non-violente.", explanation: "L'intimité émotionnelle précède l'intimité physique. Une communication ouverte sur les besoins augmente significativement la satisfaction sexuelle.", actions: ["Rituel des 3 questions chaque semaine : ce qui m'a touché·e, ce qui m'a manqué, ce que j'aimerais explorer.", "Limiter les conversations logistiques au lit — réserver l'espace à la connexion."], couple: true, soloAlt: { title: "Cultiver une relation à soi", sub: "L'intimité commence par celle qu'on a avec soi-même.", explanation: "Avant de pouvoir être intime avec quelqu'un d'autre, il faut savoir l'être avec soi. Identifier ses propres besoins, limites et envies est un travail solo essentiel — et un terrain solide pour les relations futures.", actions: ["Journal hebdo : ce qui m'a touché·e cette semaine, ce qui m'a manqué, ce que j'aimerais explorer.", "Identifier 3 limites non-négociables et 3 envies à honorer dans tes prochaines rencontres."] } },
        { id: "i3", icon: "users", color: "#2D0A2E", title: "L'impact de l'image corporelle", sub: "Pratiques d'acceptation de soi et désir.", explanation: "L'auto-jugement détourne l'attention des sensations. Travailler l'acceptation corporelle augmente la présence et la réceptivité au plaisir.", actions: ["Body scan quotidien de 5 min en se concentrant sur les sensations agréables.", "Substituer la critique miroir par une phrase neutre, descriptive."] },
      ],
    },
    Physiologie: {
      habits: [
        { id: "ph1", title: "2L d'eau par jour", sub: "Optimise la circulation sanguine et la lubrification." },
        { id: "ph2", title: "30 min de marche rapide", sub: "Stimule le NO et la circulation périphérique." },
        { id: "ph3", title: "Réduire l'alcool en semaine", sub: "Préserve les phases REM et la libido." },
      ],
      insights: [
        { id: "ph-i1", icon: "bolt", color: "#E8A923", title: "Optimiser ton énergie hormonale", sub: "Magnésium, oméga-3 et zinc.", explanation: "Une carence en magnésium ou zinc impacte directement la testostérone libre et la dopamine. Les oméga-3 régulent l'inflammation et le profil hormonal.", actions: ["Sources alimentaires ciblées : œufs, poisson gras, graines de courge, chocolat noir 85%.", "Bilan sanguin annuel incluant testostérone libre, vitamine D, ferritine."] },
      ],
    },
    Couple: {
      habits: [
        { id: "c1", title: "Dîner sans téléphone, 2x / semaine", sub: "Recrée un rituel de présence partagée." },
        { id: "c2", title: "Hugging meditation — 20 secondes", sub: "Libère ocytocine, abaisse cortisol." },
      ],
      insights: [
        { id: "c-i1", icon: "heart", color: "#B21D27", title: "Le désir spontané vs réactif", sub: "Comprendre les deux modèles du désir.", explanation: "Le désir spontané (commun chez les hommes jeunes) émerge sans stimulus. Le désir réactif émerge en réponse à la stimulation. Ne pas attendre l'envie pour agir.", actions: ["Programmer l'intimité comme un rendez-vous — sans pression de performance.", "Construire une carte du désir partagée : envies, limites, fantasmes."] },
      ],
    },
    Sommeil: {
      habits: [
        { id: "s1", title: "Heure de coucher fixe, même le week-end", sub: "Régule le rythme circadien et la sécrétion de mélatonine." },
        { id: "s2", title: "Chambre à 18-19°C", sub: "La température corporelle basse favorise l'endormissement." },
      ],
      insights: [
        { id: "s-i1", icon: "moon", color: "#6FA8DC", title: "La dette de sommeil et le désir", sub: "Le lien direct entre REM et libido.", explanation: "Chaque heure de sommeil perdue abaisse la testostérone libre de ~12% le lendemain. La phase REM est essentielle à la production de dopamine.", actions: ["Mettre en place un rituel de descente : lumières tamisées, infusion, lecture.", "Éviter l'alcool après 19h — il fragmente les phases REM."] },
      ],
    },
    Énergie: {
      habits: [
        { id: "e1", title: "Exposition à la lumière du jour avant 10h", sub: "Synchronise l'horloge interne et booste la sérotonine." },
        { id: "e2", title: "Pause active toutes les 90 min", sub: "Respecte les cycles ultradian pour maintenir la concentration." },
      ],
      insights: [
        { id: "e-i1", icon: "bolt", color: "#E8A923", title: "Optimiser les cycles d'énergie", sub: "Comprendre les rythmes ultradian.", explanation: "Le cerveau fonctionne en cycles de 90 min (rythmes ultradian). Forcer la concentration au-delà crée une dette d'énergie qui affecte la libido en soirée.", actions: ["Timer de 90 min pour les blocs de travail, puis pause de 10-20 min.", "NSDR (Non-Sleep Deep Rest) : 20 min de relaxation profonde en milieu de journée."] },
      ],
    },
  };

  /* ============================================================
     ÉTAT
     ============================================================ */
  const state = {
    stage: "welcome",
    quiz: JSON.parse(JSON.stringify(persona.quizAnswers)),
    cursor: 0,
    tab: "score",
    premium: false,
    checks: { p1: true, p2: false, p3: false },
    openInsight: null,
    planFilter: null,
    sheetExp: null,
    expFilter: "Pour toi",
  };

  function recompute() {
    const intake = mergedIntake(state.quiz);
    const score = computeScore(intake);
    const recos = getRecos(intake, state.quiz, score);
    const narrative = narrativeFor(intake, state.quiz);
    return { intake, score, recos, narrative };
  }

  /* ============================================================
     COMPOSANTS visuels portés
     ============================================================ */
  function gaugeSVG(value) {
    const size = 220, stroke = 18;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.min(1, Math.max(0, value / 100));
    const dash = c * pct;
    return `
      <div style="position:relative;width:${size}px;height:${size}px;margin:0 auto;">
        <svg width="${size}" height="${size}" class="gauge-glow">
          <defs><linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#B21D27"/><stop offset="100%" stop-color="#FF7671"/>
          </linearGradient></defs>
          <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="#F3D9C5" stroke-width="${stroke}" fill="none"/>
          <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="url(#gauge-grad)" stroke-width="${stroke}" fill="none"
            stroke-linecap="round" stroke-dasharray="${dash} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"
            style="transition:stroke-dasharray 0.8s cubic-bezier(0.2,0.8,0.2,1);"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div class="display" style="font-size:64px;font-weight:800;color:var(--aubergine);line-height:1;">${value}</div>
          <div class="label-sm text-coral" style="margin-top:4px;">X-PLORER</div>
        </div>
        <div style="position:absolute;top:18px;right:8px;width:44px;height:44px;border-radius:14px;background:#FFCB3D;display:flex;align-items:center;justify-content:center;color:#2D0A2E;box-shadow:0 8px 20px rgba(255,203,61,0.35);transform:rotate(8deg);">
          ${icon("bolt", { size: 22, strokeWidth: 2.4 })}
        </div>
      </div>`;
  }

  function sparklineSVG(data) {
    const width = 320, height = 64;
    if (!data || data.length < 2) {
      return `<div style="height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--on-surface-muted);font-size:13px;font-family:'Plus Jakarta Sans';font-weight:500;">Reviens demain pour suivre ton évolution.</div>`;
    }
    const padding = 8;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const scores = data.map((d) => d.score);
    const min = Math.min.apply(null, scores.concat([30]));
    const max = Math.max.apply(null, scores.concat([80]));
    const range = Math.max(1, max - min);
    const points = data.map((entry, i) => {
      const x = padding + (i / Math.max(1, data.length - 1)) * innerW;
      const y = padding + innerH - ((entry.score - min) / range) * innerH;
      return { x, y, score: entry.score };
    });
    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding + innerH).toFixed(1)} Z`;
    const last = points[points.length - 1];
    const first = points[0];
    const trend = last.score - first.score;
    const dots = points.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${i === points.length - 1 ? 4 : 2}" fill="${i === points.length - 1 ? "#B21D27" : "#FF7671"}"/>`).join("");
    const trendColor = trend > 0 ? "#1f8a4b" : trend < 0 ? "var(--primary)" : "var(--on-surface-muted)";
    return `
      <div style="width:100%;">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" aria-label="Évolution du X-Score">
          <defs><linearGradient id="sparkArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FF7671" stop-opacity="0.25"/><stop offset="100%" stop-color="#FF7671" stop-opacity="0"/>
          </linearGradient></defs>
          <path d="${areaD}" fill="url(#sparkArea)"/>
          <path d="${pathD}" fill="none" stroke="#B21D27" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          ${dots}
        </svg>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-family:'Plus Jakarta Sans';">
          <span style="font-size:11px;color:var(--on-surface-muted);">${data.length} bilan${data.length > 1 ? "s" : ""} · ${data[0].date.slice(5)} → ${last.score}</span>
          <span style="font-size:12px;font-weight:700;color:${trendColor};">${trend > 0 ? "+" + trend : trend === 0 ? "=" : trend}</span>
        </div>
      </div>`;
  }

  function avatar(initial, size) {
    size = size || 40;
    return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:linear-gradient(135deg,#B21D27,#FF7671);color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans';font-weight:800;font-size:${Math.round(size * 0.42)}px;box-shadow:0 6px 16px rgba(178,29,39,0.28);">${esc(initial)}</div>`;
  }

  function ribbon() {
    return `
      <div class="demo-ribbon">
        <span>✨ DÉMO — profil « Léa »</span>
        <button data-action="restart">Recommencer</button>
      </div>`;
  }

  function backHeader(label, backAction) {
    return `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button class="back-btn" data-action="${backAction}" aria-label="Retour">${icon("chevron-left", { size: 18 })}</button>
        <span class="title-md" style="flex:1;text-align:center;">${esc(label)}</span>
        <div style="width:40px;"></div>
      </div>`;
  }

  /* ============================================================
     ÉCRAN — WELCOME
     ============================================================ */
  function renderWelcome() {
    const feats = [
      { icon: "sparkles", label: "Bilan IA personnalisé en 3 min" },
      { icon: "lock", label: "100% confidentiel, hébergé en France" },
      { icon: "heart", label: "Recommandations adaptées à toi" },
    ];
    return `
      ${ribbon()}
      <div class="screen" style="padding:24px 20px 32px;display:flex;flex-direction:column;min-height:calc(100vh - 34px);">
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:30px 8px;">
          <div style="width:96px;height:96px;border-radius:28px;background:linear-gradient(135deg,#B21D27,#FF7671);display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 16px 40px -12px rgba(178,29,39,0.45);">
            <span style="font-family:'Plus Jakarta Sans';font-weight:800;font-size:42px;color:#fff;letter-spacing:-1px;">X</span>
          </div>
          <h1 class="display" style="margin:0 0 16px;font-size:36px;line-height:1.05;letter-spacing:-1.2px;">Bienvenue sur<br><span style="color:var(--primary);">X-plorer</span></h1>
          <p class="body-md text-muted" style="max-width:280px;margin-bottom:36px;">L'application qui t'aide à comprendre et explorer ton bien-être intime, sans tabou.</p>
          <div style="display:flex;flex-direction:column;gap:14px;width:100%;max-width:320px;">
            ${feats.map((f) => `
              <div class="card" style="display:flex;align-items:center;gap:14px;padding:14px 16px;text-align:left;">
                <div style="width:36px;height:36px;border-radius:12px;background:var(--surface-low);color:var(--primary);display:flex;align-items:center;justify-content:center;">${icon(f.icon, { size: 18 })}</div>
                <span class="title-md" style="flex:1;">${esc(f.label)}</span>
              </div>`).join("")}
          </div>
        </div>
        <button class="btn-primary" data-action="start-quiz" style="width:100%;padding:18px;font-size:16px;font-weight:700;">Découvrir le bilan de Léa</button>
        <p class="body-sm text-muted" style="text-align:center;margin-top:14px;">Démo interactive — réponses pré-remplies, modifiables.</p>
      </div>`;
  }

  /* ============================================================
     ÉCRAN — QUIZ (pré-rempli)
     ============================================================ */
  function visibleSteps() {
    const a = state.quiz;
    const steps = [];
    for (let i = 0; i < QUIZ.length; i++) {
      const item = QUIZ[i];
      if (item.kind !== "section" && item.showIf && !item.showIf(a)) continue;
      steps.push(i);
    }
    return steps;
  }

  function renderQuiz() {
    const steps = visibleSteps();
    const safeCursor = Math.min(state.cursor, steps.length - 1);
    state.cursor = safeCursor;
    const stepIndex = steps[safeCursor];
    const item = QUIZ[stepIndex];

    let currentSectionIndex = -1;
    for (let i = 0; i <= stepIndex; i++) if (QUIZ[i].kind === "section") currentSectionIndex = i;
    const currentSection = currentSectionIndex >= 0 ? QUIZ[currentSectionIndex] : null;

    const totalQuestions = steps.filter((i) => QUIZ[i].kind !== "section").length;
    const currentQuestionNum = steps.slice(0, safeCursor + 1).filter((i) => QUIZ[i].kind !== "section").length;
    const progress = (currentQuestionNum / Math.max(1, totalQuestions)) * 100;
    const isLast = safeCursor === steps.length - 1;

    const progressBar = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
        <button class="back-btn" data-action="quiz-prev" aria-label="Retour">${icon("chevron-left", { size: 18 })}</button>
        <div class="progress-track"><div class="progress-fill" style="width:${progress}%;"></div></div>
        ${item.kind !== "section" ? `<span class="body-sm text-muted" style="font-weight:700;min-width:36px;text-align:right;">${currentQuestionNum}/${totalQuestions}</span>` : ""}
      </div>`;

    if (item.kind === "section") {
      return `
        ${ribbon()}
        <div class="screen" style="padding:24px 20px 32px;display:flex;flex-direction:column;min-height:calc(100vh - 34px);">
          ${progressBar}
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:20px 0;">
            <div class="body-sm" style="color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:12px;">${item.optional ? "Section optionnelle" : "Section"}</div>
            <h2 class="display" style="margin:0 0 16px;font-size:36px;line-height:1.1;">${esc(item.title)}</h2>
            <p class="body-md text-muted" style="max-width:360px;margin:0 auto;">${esc(item.subtitle)}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="btn-primary" data-action="quiz-next" style="width:100%;padding:18px;font-size:16px;font-weight:700;">${item.optional ? "Je veux bien répondre" : "Continuer"}</button>
            ${item.optional ? `<button data-action="quiz-skip-optional" style="width:100%;padding:14px;font-size:14px;font-weight:600;background:none;border:none;color:var(--on-surface-muted);cursor:pointer;text-decoration:underline;">Passer cette section</button>` : ""}
          </div>
        </div>`;
    }

    const value = state.quiz[item.id];
    const opts = item.privacy ? item.opts.concat([PRIVACY_OPT]) : item.opts;
    const isSelected = (o) => (item.kind === "single" ? value === o : Array.isArray(value) && value.indexOf(o) >= 0);
    const canNext = item.kind === "single" ? !!value : Array.isArray(value) && value.length > 0;
    const prefilled = canNext;

    const optsHtml = opts.map((o) => {
      const sel = isSelected(o);
      const isPriv = o === PRIVACY_OPT;
      const cls = "quiz-opt" + (sel ? " selected" : "") + (isPriv ? " privacy" : "");
      return `<button class="${cls}" data-action="quiz-select" data-id="${esc(item.id)}" data-val="${esc(o)}"><span>${esc(o)}</span>${sel ? icon("check", { size: 18 }) : ""}</button>`;
    }).join("");

    return `
      ${ribbon()}
      <div class="screen" style="padding:24px 20px 32px;display:flex;flex-direction:column;min-height:calc(100vh - 34px);">
        ${progressBar}
        <div style="flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div class="body-sm" style="color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">${currentSection ? esc(currentSection.title) : "Bilan"}</div>
            ${prefilled ? `<span class="prefill-pill">${icon("sparkles", { size: 11 })} Réponse de Léa</span>` : ""}
          </div>
          <h2 class="display" style="margin:0 0 8px;font-size:26px;line-height:1.2;">${esc(item.q)}</h2>
          ${item.hint ? `<p class="body-sm text-muted" style="margin:0 0 24px;">${esc(item.hint)}</p>` : `<div style="height:24px;"></div>`}
          <div style="display:flex;flex-direction:column;gap:10px;">${optsHtml}</div>
        </div>
        <button class="btn-primary" data-action="quiz-next" ${canNext ? "" : "disabled"} style="width:100%;padding:18px;font-size:16px;font-weight:700;margin-top:32px;opacity:${canNext ? 1 : 0.4};cursor:${canNext ? "pointer" : "not-allowed"};">${isLast ? "Voir mes résultats" : "Continuer"}</button>
      </div>`;
  }

  /* ============================================================
     ÉCRAN — RÉSULTATS
     ============================================================ */
  function renderResults() {
    const { score, recos } = recompute();
    const answered = Object.keys(state.quiz).filter((k) => {
      const v = state.quiz[k];
      return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
    }).length;

    const detected = recos.detected.map((it) => `
      <div class="card" style="padding:16px;display:flex;align-items:center;gap:14px;">
        <div style="width:40px;height:40px;border-radius:12px;background:var(--surface-low);color:var(--primary);display:flex;align-items:center;justify-content:center;">${icon(it.icon, { size: 18 })}</div>
        <div style="flex:1;"><div class="title-md">${esc(it.label)}</div><div class="body-sm text-muted">${esc(it.val)}</div></div>
        ${icon("check", { size: 16 })}
      </div>`).join("");

    return `
      ${ribbon()}
      <div class="screen" style="padding:24px 20px 32px;">
        ${backHeader("Tes résultats", "results-back")}
        <div style="text-align:center;margin-bottom:24px;">
          <div class="body-sm" style="color:var(--primary);font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px;">Bilan IA terminé ✨</div>
          <h1 class="display" style="margin:0 0 12px;font-size:30px;line-height:1.1;">Voici ton X-Score</h1>
          <p class="body-md text-muted" style="max-width:300px;margin:0 auto;">Basé sur tes ${answered} réponses, voici ce que notre IA a détecté.</p>
        </div>
        <div class="card card-lg" style="padding:28px;margin-bottom:20px;text-align:center;background:linear-gradient(180deg,#FFF7F1,var(--surface));">
          <div style="font-family:'Plus Jakarta Sans';font-weight:800;font-size:88px;color:var(--primary);line-height:1;letter-spacing:-2px;">${score}</div>
          <div class="body-md text-muted" style="margin-top:4px;">/ 100</div>
          <div class="title-md" style="margin-top:16px;">Profil &laquo;&nbsp;${esc(recos.profileLabel)}&nbsp;&raquo;</div>
          <p class="body-sm text-muted" style="margin-top:8px;">${esc(recos.profileBlurb)}</p>
        </div>
        <h3 class="headline headline-md" style="margin:0 0 12px;">Ce que l'IA a détecté</h3>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">${detected}</div>
        <div style="position:relative;border-radius:24px;overflow:hidden;margin-bottom:24px;background:var(--surface);padding:20px;">
          <div style="filter:blur(6px);opacity:0.6;pointer-events:none;">
            <div class="title-md" style="margin-bottom:8px;">Plan d'action personnalisé</div>
            ${[100, 85, 70].map((w) => `<div style="height:12px;border-radius:6px;background:var(--surface-low);margin-bottom:8px;width:${w}%;"></div>`).join("")}
            <div class="title-md" style="margin-bottom:8px;">Recommandations IA</div>
            <div style="height:60px;border-radius:12px;background:var(--surface-low);"></div>
          </div>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,var(--surface) 80%);display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:24px;text-align:center;">
            <div style="width:48px;height:48px;border-radius:16px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">${icon("lock", { size: 20 })}</div>
            <div class="title-md" style="margin-bottom:6px;">Débloque ton plan complet</div>
            <p class="body-sm text-muted" style="margin-bottom:16px;max-width:280px;">Plan d'action, recommandations IA, accès aux thérapeutes.</p>
          </div>
        </div>
        <button class="btn-primary" data-action="results-unlock" style="width:100%;padding:18px;font-size:16px;font-weight:700;">Voir l'espace de Léa (démo) ✨</button>
        <p class="body-sm text-muted" style="text-align:center;margin-top:12px;">🔓 Déblocage gratuit dans la démo</p>
      </div>`;
  }

  /* ============================================================
     APP — tab bar + écrans
     ============================================================ */
  const TABS = [
    { id: "score", label: "Score", icon: "spark" },
    { id: "plan", label: "Plan", icon: "list" },
    { id: "experiences", label: "Expériences", icon: "compass" },
    { id: "profile", label: "Profil", icon: "users" },
  ];

  function renderTabBar() {
    return `<nav class="tabbar" aria-label="Navigation">${TABS.map((t) => `
      <button class="tab${state.tab === t.id ? " active" : ""}" data-action="tab" data-tab="${t.id}" aria-label="${t.label}">
        ${icon(t.icon, { size: 20, strokeWidth: 2.2 })}<span>${t.label}</span>
      </button>`).join("")}</nav>`;
  }

  function renderApp() {
    let screen = "";
    if (state.tab === "score") screen = renderScore();
    else if (state.tab === "plan") screen = renderPlan();
    else if (state.tab === "experiences") screen = renderExperiences();
    else screen = renderProfile();
    return `${ribbon()}<div class="demo-scroller with-tabs">${screen}</div>${renderTabBar()}${state.sheetExp ? renderSheet() : ""}`;
  }

  /* ----- SCORE ----- */
  function renderScore() {
    const { intake, score, recos, narrative } = recompute();
    const sleepFill = 1 - (recos.sleepDebt || 0.22);
    const sleepLabel = recos.sleepDebt > 0.7 ? "5h 40m" : recos.sleepDebt > 0.5 ? "6h 45m" : recos.sleepDebt > 0.3 ? "7h 30m" : "8h 12m";
    const metrics = [
      { label: "Énergie", value: (intake.energy * 10) + "%", fill: intake.energy / 10, color: "linear-gradient(90deg,#B21D27,#FF7671)", iconBg: "#FFE3E1", icon: "flame" },
      { label: "Désir", value: (intake.desire * 10) + "%", fill: intake.desire / 10, color: "linear-gradient(90deg,#E8A923,#FFCB3D)", iconBg: "#FFF3CC", icon: "heart" },
      { label: "Stress", value: intake.zen >= 7 ? "Low" : intake.zen >= 4 ? "Med" : "High", fill: 1 - intake.zen / 10, color: "linear-gradient(90deg,#4A1F4D,#6E366E)", iconBg: "#EAD9EB", icon: "wave" },
      { label: "Sommeil", value: sleepLabel, fill: sleepFill, color: "linear-gradient(90deg,#6FA8DC,#A6CFEC)", iconBg: "#DBE9F6", icon: "moon" },
    ];
    const tip = recos.tip;
    const insight = recos.insight;

    const metricsHtml = metrics.map((m) => `
      <div class="card" style="padding:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="width:30px;height:30px;border-radius:10px;background:${m.iconBg};display:flex;align-items:center;justify-content:center;color:var(--aubergine);">${icon(m.icon, { size: 16, strokeWidth: 2.2 })}</div>
          <span class="label-md text-muted" style="text-transform:uppercase;letter-spacing:0.06em;">${m.label}</span>
        </div>
        <div class="display" style="font-size:22px;font-weight:800;">${m.value}</div>
        <div style="height:8px;border-radius:999px;background:var(--surface-highest);margin-top:10px;overflow:hidden;">
          <div style="height:100%;width:${Math.min(100, m.fill * 100)}%;background:${m.color};border-radius:999px;transition:width 0.6s;"></div>
        </div>
      </div>`).join("");

    const chipsHtml = insight.chips.map((c) => `
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="label-md" style="flex:0 0 130px;color:var(--on-surface);">${esc(c.label)}</span>
        <div style="flex:1;height:10px;background:var(--surface-highest);border-radius:999px;overflow:hidden;"><div style="height:100%;width:${c.val}%;background:${c.color};border-radius:999px;"></div></div>
        <span class="label-md text-coral" style="flex:0 0 50px;text-align:right;font-weight:800;">${esc(c.impact)}</span>
      </div>`).join("");

    const narrSections = [
      { label: "CONSTAT", text: narrative.constat },
      { label: "HYPOTHÈSE", text: narrative.hypothese },
      { label: "LEVIER PRIORITAIRE", text: narrative.levier },
    ].map((s, i, arr) => `
      <div style="padding-bottom:14px;margin-bottom:14px;border-bottom:${i < arr.length - 1 ? "1px solid rgba(45,10,46,0.08)" : "none"};">
        <div class="label-sm" style="color:var(--aubergine-soft);margin-bottom:6px;letter-spacing:0.08em;">${s.label}</div>
        <p class="body-sm" style="margin:0;line-height:1.55;color:var(--on-surface);">${esc(s.text)}</p>
      </div>`).join("");

    const progHtml = narrative.programme.map((step, idx) => `
      <div style="display:flex;align-items:center;gap:10px;background:var(--surface-white);border-radius:12px;padding:10px 12px;">
        <div style="width:26px;height:26px;border-radius:8px;background:${idx === 0 ? "linear-gradient(135deg,#B21D27,#FF7671)" : "var(--surface-high)"};color:${idx === 0 ? "#fff" : "var(--aubergine)"};display:flex;align-items:center;justify-content:center;font-family:'Plus Jakarta Sans';font-weight:800;font-size:13px;flex-shrink:0;">${idx + 1}</div>
        <span class="body-sm" style="font-weight:${idx === 0 ? 700 : 500};">${esc(step)}</span>
      </div>`).join("");

    return `
      <div class="screen" style="padding:8px 24px 8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
          <button type="button" data-action="scroll-top" class="display" style="display:flex;align-items:center;gap:8px;background:none;border:none;padding:0;cursor:pointer;">
            <div style="width:30px;height:30px;border-radius:10px;background:linear-gradient(135deg,#B21D27 0%,#FF7671 100%);display:flex;align-items:center;justify-content:center;color:#fff;">${icon("compass", { size: 18, strokeWidth: 2.4 })}</div>
            <span class="headline" style="font-size:22px;font-weight:800;color:var(--primary);">X-plorer</span>
          </button>
          <button data-action="tab" data-tab="profile" style="background:none;border:none;padding:0;cursor:pointer;" aria-label="Profil">${avatar(persona.profile.initial, 40)}</button>
        </div>

        <h1 class="display display-lg" style="margin:8px 0 12px;">The X-Score</h1>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(178,29,39,0.08);border-radius:999px;margin-bottom:20px;">
          <span class="pulse-dot"></span><span class="label-md text-coral">Analyse IA en direct</span>
        </div>

        ${gaugeSVG(score)}

        <div style="text-align:center;margin:12px 0 20px;">
          <span style="display:inline-flex;align-items:center;gap:8px;background:var(--aubergine);color:#fff;padding:10px 20px;border-radius:999px;font-family:'Plus Jakarta Sans';font-weight:700;font-size:14px;">${esc(recos.mood)}</span>
        </div>

        <div class="card" style="padding:16px 18px;margin-bottom:22px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
            <span class="label-md" style="color:var(--aubergine-soft);text-transform:uppercase;letter-spacing:0.06em;">Évolution</span>
            <span class="label-sm text-muted">${persona.scoreHistory.length} mesures</span>
          </div>
          ${sparklineSVG(persona.scoreHistory)}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:24px;">${metricsHtml}</div>

        <div style="background:linear-gradient(135deg,#FFE6A0 0%,#FFCB3D 100%);border-radius:24px;padding:18px;margin-bottom:22px;">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:14px;flex-shrink:0;background:rgba(45,10,46,0.12);color:var(--aubergine);display:flex;align-items:center;justify-content:center;">${icon(tip.icon, { size: 20, strokeWidth: 2.2 })}</div>
            <div>
              <div class="label-sm" style="color:var(--aubergine);opacity:0.7;">X-PLORER TIP DU MOMENT</div>
              <div class="headline headline-sm" style="color:var(--aubergine);margin-top:4px;line-height:1.3;">${esc(tip.title)}</div>
              <p class="body-sm" style="color:var(--aubergine);margin-top:6px;opacity:0.85;line-height:1.5;">${esc(tip.body)}</p>
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#2D0A2E 0%,#4A1F4D 100%);color:#fff;border-radius:22px;padding:14px 18px;margin-bottom:14px;">
          <div style="background:linear-gradient(135deg,#FFCB3D,#E8A923);color:var(--aubergine);padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:0.08em;">★ X+ ACTIF</div>
          <span class="body-sm" style="color:#fff;opacity:0.9;font-weight:600;">Plein potentiel débloqué.</span>
        </div>

        <div class="card card-lg" style="margin-bottom:16px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(178,29,39,0.18) 0%,rgba(178,29,39,0) 70%);border-radius:999px;pointer-events:none;"></div>
          <div class="label-sm text-coral" style="display:flex;align-items:center;gap:6px;">${icon("spark", { size: 14, strokeWidth: 2.4 })} ANALYSE PROFONDE IA</div>
          <div class="headline headline-md" style="margin-top:8px;margin-bottom:12px;">${esc(insight.title)}</div>
          <p class="body-md" style="color:var(--on-surface);margin-bottom:16px;line-height:1.55;">${esc(insight.lead)}</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">${chipsHtml}</div>
          <div style="background:linear-gradient(135deg,rgba(178,29,39,0.06) 0%,rgba(255,118,113,0.08) 100%);border-radius:18px;padding:16px;margin-bottom:12px;">
            <div class="label-sm text-coral" style="margin-bottom:6px;">${esc(insight.tag)}</div>
            <div class="title-md" style="margin-bottom:4px;">${esc(insight.windowTitle)}</div>
            <p class="body-sm text-muted">${esc(insight.windowNote)}</p>
          </div>
          <div style="background:var(--surface-low);border-radius:18px;padding:18px 18px 8px;margin-bottom:12px;">
            <div class="label-sm text-coral" style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">${icon("spark", { size: 12, strokeWidth: 2.4 })} DIAGNOSTIC DÉTAILLÉ</div>
            ${narrSections}
            <div style="margin-top:4px;">
              <div class="label-sm" style="color:var(--aubergine-soft);margin-bottom:8px;letter-spacing:0.08em;">PROGRAMME 4 SEMAINES</div>
              <div style="display:flex;flex-direction:column;gap:8px;">${progHtml}</div>
            </div>
          </div>
          <button class="btn-secondary" data-action="tab" data-tab="plan" style="width:100%;">Voir mon plan adapté ${icon("chevron-right", { size: 14 })}</button>
        </div>
      </div>`;
  }

  /* ----- PLAN ----- */
  function adaptItem(item, partnered) {
    if (item.couple && !partnered) {
      if (item.soloAlt) return Object.assign({}, item, item.soloAlt, { couple: false });
      return null;
    }
    return item;
  }

  function renderPlan() {
    const { recos, narrative } = recompute();
    const partnered = isPartnered(state.quiz);
    const allFilters = ["Psychologie", "Physiologie", "Couple", "Sommeil", "Énergie"];
    const filters = partnered ? allFilters : allFilters.filter((f) => f !== "Couple");
    if (!state.planFilter || !filters.includes(state.planFilter)) {
      state.planFilter = filters.includes(recos.planEmphasis) ? recos.planEmphasis : "Psychologie";
    }
    const raw = PLAN_DATA[state.planFilter] || PLAN_DATA.Psychologie;
    const habits = raw.habits.map((h) => adaptItem(h, partnered)).filter(Boolean);
    const insights = raw.insights.map((i) => adaptItem(i, partnered)).filter(Boolean);

    const progBlock = narrative.programme.length > 0 ? `
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${narrative.programme.map((step, idx) => {
          const active = idx === 0;
          return `<div style="display:flex;align-items:center;gap:12px;background:${active ? "linear-gradient(135deg,#2D0A2E 0%,#4A1F4D 100%)" : "var(--surface-white)"};color:${active ? "#fff" : "var(--on-surface)"};border-radius:18px;padding:14px 16px;box-shadow:${active ? "0 12px 28px -10px rgba(45,10,46,0.35)" : "0 4px 14px rgba(45,10,46,0.04)"};">
            <div style="width:36px;height:36px;border-radius:12px;background:${active ? "linear-gradient(135deg,#B21D27,#FF7671)" : "var(--surface-low)"};color:${active ? "#fff" : "var(--aubergine)"};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:'Plus Jakarta Sans';font-weight:800;font-size:15px;">${idx + 1}</div>
            <div style="flex:1;min-width:0;"><div style="font-family:'Plus Jakarta Sans';font-weight:700;font-size:14px;margin-bottom:${active ? 2 : 0};">${esc(step)}</div>${active ? `<div class="label-sm" style="color:rgba(255,255,255,0.65);letter-spacing:0.06em;">EN COURS</div>` : ""}</div>
          </div>`;
        }).join("")}
      </div>` : `<div class="card" style="padding:18px;background:var(--surface-low);border-radius:18px;"><p class="body-sm text-muted" style="margin:0;">Termine ton bilan IA pour générer ton programme personnalisé.</p></div>`;

    const habitsHtml = habits.map((h, i) => `
      <div class="check-row${state.checks[h.id] ? " done" : ""}" data-action="toggle-check" data-id="${h.id}" style="display:flex;gap:14px;align-items:flex-start;padding:16px 14px;background:${i % 2 === 0 ? "var(--surface-white)" : "transparent"};border-radius:18px;cursor:pointer;margin-bottom:${i === habits.length - 1 ? 0 : 4}px;">
        <div style="width:24px;height:24px;border-radius:8px;flex-shrink:0;background:${state.checks[h.id] ? "linear-gradient(135deg,#B21D27,#FF7671)" : "var(--surface-high)"};display:flex;align-items:center;justify-content:center;color:#fff;margin-top:2px;transition:background .2s;">${state.checks[h.id] ? icon("check", { size: 16, strokeWidth: 3 }) : ""}</div>
        <div style="flex:1;"><div class="title-md check-title" style="font-weight:700;">${esc(h.title)}</div><div class="body-sm text-muted" style="margin-top:2px;">${esc(h.sub)}</div></div>
      </div>`).join("");

    const insightsHtml = insights.map((ins) => {
      const open = state.openInsight === ins.id;
      const iconBg = ins.color === "#E8A923" ? "#FFF3CC" : ins.color === "#2D0A2E" ? "#EAD9EB" : ins.color === "#6FA8DC" ? "#DBE9F6" : "#FFE3E1";
      const actionsHtml = ins.actions.map((a) => {
        const parts = a.split(" — ");
        return `<p class="body-md" style="margin:0 0 10px;"><span style="font-weight:700;">${esc(parts[0])}</span>${parts.length > 1 ? " — " + esc(parts.slice(1).join(" — ")) : ""}</p>`;
      }).join("");
      return `
        <div class="card card-lg" style="padding:20px;">
          <button data-action="toggle-insight" data-id="${ins.id}" style="display:flex;align-items:center;gap:14px;width:100%;background:none;border:none;padding:0;cursor:pointer;text-align:left;">
            <div style="width:44px;height:44px;border-radius:999px;flex-shrink:0;background:${iconBg};color:${ins.color};display:flex;align-items:center;justify-content:center;">${icon(ins.icon, { size: 20, strokeWidth: 2.2 })}</div>
            <div style="flex:1;"><div class="headline headline-sm">${esc(ins.title)}</div><div class="body-sm text-muted" style="margin-top:2px;">${esc(ins.sub)}</div></div>
            <div style="color:var(--on-surface-muted);transform:${open ? "rotate(180deg)" : "none"};transition:transform .25s;">${icon("chevron-down", { size: 20 })}</div>
          </button>
          <div class="accordion-body${open ? " open" : ""}" style="margin-top:${open ? 16 : 0}px;">
            <div>
              <div style="background:var(--surface-low);border-left:4px solid ${ins.color};border-radius:12px;padding:14px 16px;margin-bottom:14px;">
                <div class="label-sm text-muted" style="margin-bottom:6px;">L'EXPLICATION SCIENTIFIQUE</div>
                <p class="body-md" style="margin:0;color:var(--aubergine-soft);">${esc(ins.explanation)}</p>
              </div>
              <div class="label-sm" style="color:var(--aubergine);margin-bottom:8px;">ACTIONS RECOMMANDÉES</div>
              ${actionsHtml}
            </div>
          </div>
        </div>`;
    }).join("");

    const filtersHtml = filters.map((f) => `<button class="chip${state.planFilter === f ? " active" : ""}" data-action="plan-filter" data-filter="${esc(f)}">${esc(f)}</button>`).join("");

    return `
      <div class="screen" style="padding-top:8px;">
        <div style="padding:0 24px 18px;display:flex;justify-content:space-between;align-items:center;">
          <h1 class="display display-md" style="margin:0;">Mon plan<br>de soin</h1>
          <button data-action="tab" data-tab="profile" style="background:none;border:none;padding:0;cursor:pointer;" aria-label="Profil">${avatar(persona.profile.initial, 44)}</button>
        </div>
        <div style="padding:0 24px;margin-bottom:28px;">
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;"><h2 class="headline headline-md" style="margin:0;">Ton programme 4 semaines</h2></div>
          ${progBlock}
        </div>
        <div class="h-scroll" style="margin-bottom:24px;">${filtersHtml}</div>
        <div style="padding:0 24px;">
          <h2 class="headline headline-md" style="margin:0 0 14px;">Habitudes quotidiennes</h2>
          <div style="background:var(--surface-low);border-radius:24px;padding:6px;margin-bottom:30px;">${habitsHtml}</div>
          <h2 class="headline headline-md" style="margin:0 0 14px;">Analyse &amp; Conseils</h2>
          <div style="display:flex;flex-direction:column;gap:14px;">${insightsHtml}</div>
        </div>
      </div>`;
  }

  /* ----- EXPERIENCES ----- */
  function expTag(c) { return `${c.format.toUpperCase()} · ${c.duration}`; }

  function renderExperiences() {
    const { intake } = recompute();
    const partnered = isPartnered(state.quiz);
    const ranked = rankExperiences(intake, state.quiz);
    const byCat = ranked.byCategory;
    const allCategories = ["Pour toi", "Escapade", "Méditation", "Respiration", partnered ? "Couple" : "Solo", "Énergie", "Éducation", "Tout"];
    const filters = allCategories.filter((f) => {
      if (f === "Pour toi" || f === "Tout") return true;
      if (f === "Solo" || f === "Couple") return true;
      return (byCat[f] ? byCat[f].length : 0) > 0;
    });
    if (filters.indexOf(state.expFilter) < 0) state.expFilter = "Pour toi";

    let displayed;
    if (state.expFilter === "Pour toi") displayed = ranked.topForYou;
    else if (state.expFilter === "Tout") displayed = window.XEngine.EXPERIENCES.filter((e) => !(e.partneredOnly && !partnered) && !(e.soloOnly && partnered));
    else displayed = byCat[state.expFilter] || [];

    const hero = displayed[0];
    const rest = displayed.slice(1);
    const lockedBadge = (e) => (e.premium && !state.premium);

    const heroHtml = hero ? `
      <div data-action="open-exp" data-id="${hero.id}" style="margin:0 24px 16px;border-radius:24px;overflow:hidden;background:${hero.bg};padding:20px;min-height:180px;display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;position:relative;">
        <div style="position:absolute;top:14px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          ${state.expFilter === "Pour toi" ? `<span style="background:rgba(255,255,255,0.95);color:var(--primary);border-radius:999px;padding:5px 11px;font-family:'Plus Jakarta Sans';font-weight:800;font-size:10.5px;letter-spacing:0.08em;">RECOMMANDÉ</span>` : "<span></span>"}
          ${hero.premium ? `<span style="margin-left:auto;background:rgba(0,0,0,0.35);color:#fff;border-radius:999px;padding:5px 11px;font-family:'Plus Jakarta Sans';font-weight:700;font-size:11px;display:inline-flex;align-items:center;gap:5px;">${icon("lock", { size: 11, strokeWidth: 2.5 })} Premium</span>` : ""}
        </div>
        <span style="align-self:flex-start;background:rgba(255,255,255,0.18);border-radius:999px;padding:5px 10px;font-family:'Plus Jakarta Sans';font-weight:700;font-size:10.5px;color:#fff;letter-spacing:0.6px;margin-bottom:10px;">${esc(expTag(hero))}</span>
        <div class="headline headline-md" style="color:#fff;margin-bottom:4px;">${esc(hero.title)}</div>
        <div style="color:rgba(255,255,255,0.82);font-size:13px;font-family:'Be Vietnam Pro';">${esc(hero.desc)}</div>
      </div>` : "";

    const smallCard = (exp) => `
      <div class="card" data-action="open-exp" data-id="${exp.id}" style="padding:14px;cursor:pointer;position:relative;overflow:hidden;">
        ${lockedBadge(exp) ? `<div style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);border-radius:999px;padding:3px 8px;display:flex;align-items:center;gap:4px;z-index:2;">${icon("lock", { size: 10, strokeWidth: 2.5 })}<span style="color:#fff;font-family:'Plus Jakarta Sans';font-weight:700;font-size:10px;">Premium</span></div>` : ""}
        <div style="width:36px;height:36px;border-radius:12px;background:${exp.bg};display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:10px;">${icon(exp.icon, { size: 16, strokeWidth: 2.2 })}</div>
        <div style="font-family:'Plus Jakarta Sans';font-weight:700;font-size:10px;color:var(--on-surface-muted);letter-spacing:0.5px;margin-bottom:3px;text-transform:uppercase;">${esc(expTag(exp))}</div>
        <div class="body-sm" style="font-weight:700;line-height:1.3;">${esc(exp.title)}</div>
      </div>`;

    const leftCol = rest.filter((_, i) => i % 2 === 0).map(smallCard).join("");
    const rightCol = rest.filter((_, i) => i % 2 === 1).map(smallCard).join("");

    const filtersHtml = filters.map((f) => `<button class="chip${state.expFilter === f ? " active" : ""}" data-action="exp-filter" data-filter="${esc(f)}">${esc(f)}</button>`).join("");

    return `
      <div class="screen" style="padding-top:8px;">
        <div style="padding:0 24px 18px;">
          <h1 class="display display-md" style="margin:0 0 4px;">Expériences</h1>
          <p class="body-md text-muted" style="margin:0;">${state.expFilter === "Pour toi" ? "Sélectionnées selon ton profil." : "Exercices, méditations et contenus guidés."}</p>
        </div>
        <div class="h-scroll" style="margin-bottom:20px;">${filtersHtml}</div>
        ${heroHtml}
        ${rest.length > 0 ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 24px;">
          <div style="display:flex;flex-direction:column;gap:12px;">${leftCol}</div>
          <div style="display:flex;flex-direction:column;gap:12px;padding-top:24px;">${rightCol}</div>
        </div>` : ""}
        ${displayed.length === 0 ? `<div style="margin:0 24px;padding:24px;border-radius:20px;background:var(--surface-low);text-align:center;"><p class="body-sm text-muted" style="margin:0;">Aucune expérience dans cette catégorie pour ce profil. Essaie un autre filtre.</p></div>` : ""}
      </div>`;
  }

  function findExp(id) { return window.XEngine.EXPERIENCES.find((e) => e.id === id); }

  function renderSheet() {
    const exp = state.sheetExp;
    if (!exp) return "";
    const locked = exp.premium && !state.premium;
    const tags = [exp.format, exp.duration, exp.category];
    return `
      <div data-action="close-sheet" style="position:fixed;inset:0;background:rgba(45,10,46,0.42);backdrop-filter:blur(8px);z-index:80;display:flex;align-items:flex-end;justify-content:center;">
        <div data-stop="1" style="width:100%;max-width:436px;background:var(--surface);border-radius:32px 32px 0 0;padding:20px 24px 28px;max-height:86%;overflow-y:auto;box-shadow:0 -20px 60px rgba(45,10,46,0.2);">
          <div style="width:44px;height:5px;border-radius:999px;background:rgba(45,10,46,0.18);margin:0 auto 16px;"></div>
          <div style="width:100%;height:120px;border-radius:20px;background:${exp.bg};display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:#fff;">${icon(exp.icon, { size: 40, strokeWidth: 1.8 })}</div>
          <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
            ${tags.map((t) => `<span class="chip-tag" style="display:inline-flex;padding:4px 10px;border-radius:999px;background:var(--surface-low);color:var(--aubergine);font-size:11px;font-weight:600;">${esc(t)}</span>`).join("")}
            ${exp.premium ? `<span style="display:inline-flex;padding:4px 10px;border-radius:999px;background:linear-gradient(135deg,#B21D27,#FF7671);color:#fff;font-size:11px;font-weight:600;">Premium</span>` : ""}
          </div>
          <div class="headline headline-md" style="margin-bottom:10px;">${esc(exp.title)}</div>
          <p class="body-md text-muted" style="margin-bottom:20px;">${esc(exp.desc)}</p>
          <button class="btn-primary" data-action="close-sheet" style="width:100%;">${locked ? "Découvrir le Premium" : icon("play", { size: 16, strokeWidth: 2.5 }) + " Commencer"}</button>
        </div>
      </div>`;
  }

  /* ----- PROFIL ----- */
  function renderProfile() {
    const p = persona.profile;
    const { score, recos } = recompute();
    const goals = p.goals.map((g) => `<div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border-radius:10px;background:var(--surface-low);color:var(--primary);display:flex;align-items:center;justify-content:center;">${icon("heart", { size: 16 })}</div><span class="title-md" style="flex:1;">${esc(g)}</span></div>`).join("");
    const stats = [
      { label: "X-Score", val: score },
      { label: "Check-ins", val: p.checkins },
      { label: "Série", val: p.streak + " j" },
    ].map((s) => `<div class="card" style="padding:16px;text-align:center;"><div class="display" style="font-size:26px;font-weight:800;color:var(--primary);">${s.val}</div><div class="label-md text-muted" style="text-transform:uppercase;letter-spacing:0.06em;margin-top:4px;">${s.label}</div></div>`).join("");
    return `
      <div class="screen" style="padding:8px 24px 8px;">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;margin:16px 0 24px;">
          ${avatar(p.initial, 88)}
          <h1 class="display display-md" style="margin:16px 0 4px;">${esc(p.name)}</h1>
          <p class="body-md text-muted" style="margin:0;">${esc(p.email)}</p>
          <span style="margin-top:10px;display:inline-flex;align-items:center;gap:6px;background:rgba(178,29,39,0.08);color:var(--primary);padding:6px 14px;border-radius:999px;font-family:'Plus Jakarta Sans';font-weight:700;font-size:12px;">Profil « ${esc(recos.profileLabel)} »</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">${stats}</div>
        <h2 class="headline headline-md" style="margin:0 0 12px;">Mes objectifs</h2>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">${goals}</div>
        <div class="card" style="padding:16px;display:flex;align-items:center;gap:12px;background:var(--surface-low);">
          <div style="width:36px;height:36px;border-radius:12px;background:#fff;color:var(--primary);display:flex;align-items:center;justify-content:center;">${icon("lock", { size: 16 })}</div>
          <span class="body-sm text-muted" style="flex:1;">Données chiffrées · Hébergées en France 🇫🇷 · Jamais revendues</span>
        </div>
      </div>`;
  }

  /* ============================================================
     RENDER + NAVIGATION
     ============================================================ */
  function render(keepScroll) {
    const y = window.scrollY;
    if (state.stage === "welcome") root.innerHTML = renderWelcome();
    else if (state.stage === "quiz") root.innerHTML = renderQuiz();
    else if (state.stage === "results") root.innerHTML = renderResults();
    else root.innerHTML = renderApp();
    if (keepScroll) window.scrollTo(0, y);
    else window.scrollTo(0, 0);
  }

  function notifyParent(type) {
    try {
      if (window.self !== window.top) window.parent.postMessage({ source: "xplorer-demo", type: type }, "*");
    } catch (e) { /* noop */ }
  }

  root.addEventListener("click", function (e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;

    switch (action) {
      case "start-quiz":
        state.stage = "quiz"; state.cursor = 0; render(); break;
      case "quiz-select": {
        const id = el.dataset.id, val = el.dataset.val;
        const item = QUIZ.find((q) => q.id === id);
        if (!item) break;
        if (item.kind === "single") state.quiz[id] = val;
        else {
          const arr = Array.isArray(state.quiz[id]) ? state.quiz[id].slice() : [];
          const idx = arr.indexOf(val);
          if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
          state.quiz[id] = arr;
        }
        render(true);
        break;
      }
      case "quiz-next": {
        const steps = visibleSteps();
        if (state.cursor < steps.length - 1) { state.cursor++; render(); }
        else { state.stage = "results"; render(); }
        break;
      }
      case "quiz-prev": {
        if (state.cursor === 0) { state.stage = "welcome"; render(); }
        else { state.cursor--; render(); }
        break;
      }
      case "quiz-skip-optional": {
        const steps = visibleSteps();
        for (let i = state.cursor + 1; i < steps.length; i++) {
          const it = QUIZ[steps[i]];
          let secIdx = -1;
          for (let j = 0; j <= steps[i]; j++) if (QUIZ[j].kind === "section") secIdx = j;
          const sec = secIdx >= 0 ? QUIZ[secIdx] : null;
          if (it.kind === "section" && !it.optional) { state.cursor = i; render(); return; }
          if (it.kind !== "section" && sec && !sec.optional) { state.cursor = i; render(); return; }
        }
        state.stage = "results"; render();
        break;
      }
      case "results-back":
        state.stage = "quiz"; render(); break;
      case "results-unlock":
        state.stage = "app"; state.tab = "score"; state.premium = true; render(); break;
      case "tab":
        state.tab = el.dataset.tab; render(); break;
      case "toggle-check": {
        const id = el.dataset.id;
        state.checks[id] = !state.checks[id]; render(true); break;
      }
      case "toggle-insight": {
        const id = el.dataset.id;
        state.openInsight = state.openInsight === id ? null : id; render(true); break;
      }
      case "plan-filter":
        state.planFilter = el.dataset.filter; state.openInsight = null; render(true); break;
      case "exp-filter":
        state.expFilter = el.dataset.filter; render(true); break;
      case "open-exp":
        state.sheetExp = findExp(el.dataset.id); render(true); break;
      case "close-sheet":
        state.sheetExp = null; render(true); break;
      case "scroll-top":
        window.scrollTo({ top: 0, behavior: "smooth" }); break;
      case "restart":
        state.stage = "welcome"; state.cursor = 0; state.tab = "score";
        state.premium = false; state.openInsight = null; state.planFilter = null;
        state.expFilter = "Pour toi"; state.sheetExp = null;
        state.quiz = JSON.parse(JSON.stringify(persona.quizAnswers));
        state.checks = { p1: true, p2: false, p3: false };
        render(); break;
    }
  });

  // Prevent sheet inner clicks from closing (handled by close on backdrop)
  root.addEventListener("click", function (e) {
    const stop = e.target.closest('[data-stop="1"]');
    if (stop && !e.target.closest('[data-action="close-sheet"]')) e.stopPropagation();
  }, true);

  // Allow the landing page (parent) to reset / control the demo
  window.addEventListener("message", function (e) {
    if (e.data && e.data.source === "xplorer-landing" && e.data.type === "restart") {
      state.stage = "welcome"; state.cursor = 0; state.tab = "score"; state.premium = false;
      state.quiz = JSON.parse(JSON.stringify(persona.quizAnswers));
      state.checks = { p1: true, p2: false, p3: false };
      render();
    }
  });

  render();
})();
