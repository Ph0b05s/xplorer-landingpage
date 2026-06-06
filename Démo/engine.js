/* ============================================================
   X-plorer — DÉMO : moteur
   Portage fidèle de :
     - x-plorer-app/src/lib/relationship.ts   (isPartnered)
     - x-plorer-app/src/lib/scoring.ts        (computeScore)
     - x-plorer-app/src/lib/recommendations.ts (getRecos)
     - x-plorer-app/src/lib/experiences-catalog.ts (rankExperiences, sous-ensemble)
   Aucune logique modifiée — transcription JS du prototype.
   ============================================================ */
(function (global) {
  /* ---------- relationship.ts ---------- */
  function isPartnered(quiz) {
    const r = (quiz.relationship || "").toLowerCase();
    if (!r) return false;
    return /en couple|mari[ée]|pacs|relation libre/.test(r);
  }

  /* ---------- scoring.ts ---------- */
  function computeScore(intake) {
    const raw =
      (intake.energy / 10) * 30 +
      (intake.desire / 10) * 30 +
      (intake.zen / 10) * 25 +
      15;
    return Math.min(99, Math.max(20, Math.round(raw)));
  }

  /* ---------- recommendations.ts ---------- */
  function stressScoreFrom(stressVal, zen) {
    if (/constamment|mauvais/i.test(stressVal)) return 0.9;
    if (/souvent|anxieux/i.test(stressVal)) return 0.72;
    if (/plut[ôo]t|calme|g[ée]n[ée]ralement/i.test(stressVal)) return 0.38;
    if (/d[ée]tendu/i.test(stressVal)) return 0.18;
    return Math.max(0.15, Math.min(0.9, (10 - zen) / 12));
  }

  function sleepDebtFrom(sleepVal) {
    if (/tr[èe]s perturb[ée]|mauvais/i.test(sleepVal)) return 0.86;
    if (/l[ée]ger|agit[ée]|irr[ée]gulier/i.test(sleepVal)) return 0.62;
    if (/correct/i.test(sleepVal)) return 0.4;
    if (/r[ée]parateur|excellent/i.test(sleepVal)) return 0.18;
    return 0.45;
  }

  function getRecos(intake, quiz, score) {
    const z = intake.zen != null ? intake.zen : 5;
    const e = intake.energy != null ? intake.energy : 5;
    const d = intake.desire != null ? intake.desire : 5;

    const stressVal = intake.stressLevel != null ? intake.stressLevel : (quiz.stress || "");
    const sleepVal = intake.sleep != null ? intake.sleep : (quiz.sleep || "");
    const context = intake.context != null ? intake.context : "";
    const goal = quiz.goal || "";
    const relationship = quiz.relationship || "";
    const partnered = isPartnered(quiz);

    const stressScore = stressScoreFrom(stressVal, z);
    const sleepDebt = sleepDebtFrom(sleepVal);

    const wantsCouple =
      partnered && (/couple/i.test(context) || /reconnecter/i.test(goal));

    // ===== Profile label =====
    let profileLabel, profileBlurb;
    if (score >= 80 && z >= 7) {
      profileLabel = "En pleine forme";
      profileBlurb =
        "Tu es dans une fenêtre favorable — capitalise pour ancrer de bonnes habitudes.";
    } else if (wantsCouple) {
      profileLabel = "En reconnexion";
      profileBlurb =
        "La connexion émotionnelle peut se reconstruire — quelques rituels simples suffisent.";
    } else if (/image corporelle/i.test(context)) {
      profileLabel = "En acceptation";
      profileBlurb =
        "L'image que tu as de toi influence ta réceptivité — on travaille cette présence.";
    } else if (/performance|anxi[ée]t[ée]/i.test(context)) {
      profileLabel = "À désamorcer";
      profileBlurb =
        "Le mental tourne — recréer un terrain de sécurité libérera ton désir.";
    } else if (stressScore > 0.65 || z < 4) {
      profileLabel = "Sous tension";
      profileBlurb =
        "Ton corps est en mode alerte. Le désir reviendra avec le relâchement.";
    } else if (sleepDebt > 0.6 || e < 4) {
      profileLabel = "À recharger";
      profileBlurb =
        "Sommeil et énergie alimentent tout le reste — on commence par là.";
    } else if (d < 4) {
      profileLabel = "À réveiller";
      profileBlurb =
        "Ton désir est en pause — on va le ranimer par les sens, pas par la pression.";
    } else {
      profileLabel = "En quête d'équilibre";
      profileBlurb =
        "Ton désir et ton énergie sont en dialogue — quelques ajustements peuvent tout changer.";
    }

    // ===== Mood badge =====
    const mood =
      score >= 80 ? "En feu ! 🔥"
        : score >= 60 ? "Sur la bonne voie 🌶️"
          : score >= 40 ? "À recharger 🪫"
            : "Sous l'eau 🥵";

    // ===== Tip du moment =====
    const tipPool = [];
    if (sleepDebt > 0.55)
      tipPool.push({ icon: "moon", title: "Couvre-feu numérique ce soir 🌙", body: "30 min sans écran avant le coucher — la mélatonine et la dopamine te remercient." });
    if (stressScore > 0.65 || z < 4)
      tipPool.push({ icon: "wave", title: "Cohérence cardiaque 4-7-8 🌬", body: "Inspire 4, retiens 7, expire 8. Trois cycles. Le parasympathique fait le reste." });
    if (e < 5)
      tipPool.push({ icon: "bolt", title: "Marche de 12 min ⚡", body: "Une marche brève augmente l'oxyde nitrique — énergie immédiate, sans dette." });
    if (partnered && /couple/i.test(context))
      tipPool.push({ icon: "users", title: "Hugging meditation, 20 sec 🫂", body: "Une étreinte qui dure libère l'ocytocine et baisse le cortisol — testé en couple." });
    if (/image corporelle/i.test(context))
      tipPool.push({ icon: "lightbulb", title: "Body scan, 5 min ✨", body: "Sens chaque zone du corps sans jugement. La présence remplace la critique." });
    if (/performance|anxi[ée]t[ée]/i.test(context)) {
      if (partnered) {
        tipPool.push({ icon: "heart", title: "Sensate focus, 10 min 💞", body: "Toucher non-exigeant avec ton/ta partenaire, sans objectif. La performance s'efface." });
      } else {
        tipPool.push({ icon: "heart", title: "Self-toucher mindful, 10 min ✨", body: "Explore tes sensations sans objectif ni jugement. Le plaisir n'a pas besoin d'un·e partenaire pour exister." });
      }
    }
    if (d < 5 && z >= 5)
      tipPool.push({ icon: "spark", title: "Note 3 sensations agréables ✨", body: "L'attention portée au plaisir augmente la réceptivité — pas besoin de stimulus." });
    if (tipPool.length === 0)
      tipPool.push({ icon: "lightbulb", title: "Hydrate-toi 💧", body: "Un grand verre d'eau — ton énergie a besoin d'hydratation pour durer jusqu'au soir." });

    const tip = tipPool[0];

    // ===== AI insight =====
    const pct = (x) => Math.round(x * 100);
    let insight;

    if (wantsCouple) {
      insight = {
        tag: "★ TRIO DE RECONNEXION DÉTECTÉ",
        title: "Comment recréer la connexion sans forcer le contact",
        lead: "3 dynamiques identifiées qui éloignent les couples installés : routine logistique (32% du temps de parole), absence de rituels physiques non-sexuels, et désir réactif non-reconnu — le trio crée un creux émotionnel reproductible.",
        chips: [
          { label: "Charge logistique", val: 72, color: "linear-gradient(90deg, #4A1F4D, #6E366E)", impact: "−15 pts" },
          { label: "Rituels d'intimité", val: 58, color: "linear-gradient(90deg, #B21D27, #FF7671)", impact: "−11 pts" },
          { label: "Communication", val: 44, color: "linear-gradient(90deg, #6FA8DC, #A6CFEC)", impact: "−7 pts" },
        ],
        windowTitle: /mari[ée]|couple/i.test(relationship) ? "Samedi matin, 9h-11h" : "Vendredi soir, 21h-23h",
        windowNote: "Vous retrouvez un désir partagé +28% sur cette fenêtre. Ton plan a été adapté.",
      };
    } else if (/image corporelle/i.test(context)) {
      insight = {
        tag: "★ MÉCANISME D'AUTO-OBSERVATION",
        title: "Pourquoi l'auto-jugement détourne ton attention du plaisir",
        lead: "2 mécanismes activés : spectatoring (observer son propre corps depuis l'extérieur) et anticipation négative. Ces deux pratiques activent le cortex préfrontal et bloquent l'accès aux sensations.",
        chips: [
          { label: "Auto-observation", val: 76, color: "linear-gradient(90deg, #4A1F4D, #6E366E)", impact: "−16 pts" },
          { label: "Comparaison sociale", val: 51, color: "linear-gradient(90deg, #6FA8DC, #A6CFEC)", impact: "−10 pts" },
          { label: "Présence corporelle", val: 38, color: "linear-gradient(90deg, #B21D27, #FF7671)", impact: "−6 pts" },
        ],
        windowTitle: "Mardi-Jeudi, 7h-9h",
        windowNote: "Tu es plus connecté·e à tes sensations le matin (+22%). Ton plan a été adapté.",
      };
    } else if (/performance|anxi[ée]t[ée]/i.test(context)) {
      insight = {
        tag: "★ BOUCLE ANXIÉTÉ-ÉVITEMENT",
        title: "Le cycle anxiété-évitement-anxiété et comment le rompre",
        lead: "3 phases détectées : anticipation négative avant l'intimité, hypervigilance pendant, rumination après. Chacune renforce les suivantes dans une boucle auto-alimentée.",
        chips: [
          { label: "Anxiété anticipatoire", val: 81, color: "linear-gradient(90deg, #4A1F4D, #6E366E)", impact: "−19 pts" },
          { label: "Attentes de performance", val: 68, color: "linear-gradient(90deg, #B21D27, #FF7671)", impact: "−13 pts" },
          { label: "Dette de sommeil", val: pct(sleepDebt), color: "linear-gradient(90deg, #6FA8DC, #A6CFEC)", impact: `−${Math.round(sleepDebt * 15)} pts` },
        ],
        windowTitle: "Dimanche, 10h-13h",
        windowNote: "Hors fenêtre de performance, ton corps répond +34%. Ton plan a été adapté.",
      };
    } else if (sleepDebt > 0.6) {
      insight = {
        tag: "★ DETTE DE SOMMEIL CHRONIQUE",
        title: "Pourquoi ton sommeil tire ton désir vers le bas",
        lead: "Corrélation forte (r=0.71) : chaque heure de sommeil perdue abaisse ta testostérone libre de ~12% le lendemain. Le manque de phase REM réduit aussi la dopamine — moteur du désir.",
        chips: [
          { label: "Dette de sommeil", val: pct(sleepDebt), color: "linear-gradient(90deg, #6FA8DC, #A6CFEC)", impact: `−${Math.round(sleepDebt * 22)} pts` },
          { label: "Phases REM manquées", val: 64, color: "linear-gradient(90deg, #4A1F4D, #6E366E)", impact: "−12 pts" },
          { label: "Charge mentale", val: pct(stressScore), color: "linear-gradient(90deg, #B21D27, #FF7671)", impact: `−${Math.round(stressScore * 11)} pts` },
        ],
        windowTitle: "Dimanche, 11h-14h (après grasse matinée)",
        windowNote: "Ton désir spontané grimpe +29% après une nuit de 8h+. Ton plan a été adapté.",
      };
    } else {
      insight = {
        tag: "★ TRIO DE FACTEURS CORRÉLÉS",
        title: "Pourquoi ton désir baisse les soirs de semaine",
        lead: "3 facteurs corrélés détectés. Charge mentale > 7/10 le mardi-jeudi, sommeil < 7h sur la même fenêtre, et phase lutéale tardive — ce trio crée un creux de désir reproductible entre 19h et 22h.",
        chips: [
          { label: "Charge mentale", val: pct(stressScore), color: "linear-gradient(90deg, #4A1F4D, #6E366E)", impact: `−${Math.round(stressScore * 22)} pts` },
          { label: "Dette de sommeil", val: pct(sleepDebt), color: "linear-gradient(90deg, #6FA8DC, #A6CFEC)", impact: `−${Math.round(sleepDebt * 15)} pts` },
          { label: "Phase hormonale", val: 52, color: "linear-gradient(90deg, #B21D27, #FF7671)", impact: "−9 pts" },
        ],
        windowTitle: e >= 7 ? "Mardi-Jeudi, 7h-10h" : "Vendredi-Dimanche, 14h-17h",
        windowNote: e >= 7
          ? "Ton pic d'énergie matinal +31%. Ton plan a été adapté."
          : "Ton désir spontané augmente de +34% sur cette fenêtre.",
      };
    }

    // ===== Plan emphasis =====
    let planEmphasis;
    if (wantsCouple) planEmphasis = "Couple";
    else if (sleepDebt > 0.55 || e < 4) planEmphasis = "Physiologie";
    else planEmphasis = "Psychologie";

    // ===== Detected items =====
    const detected = [
      {
        icon: "moon",
        label: "Sommeil & récupération",
        val: sleepDebt > 0.7 ? "Très perturbé" : sleepDebt > 0.5 ? "Légèrement irrégulier" : sleepDebt > 0.3 ? "Plutôt correct" : "Réparateur",
      },
      {
        icon: "brain",
        label: "Charge mentale",
        val: stressScore > 0.7 ? "Très élevée" : stressScore > 0.5 ? "Modérée à élevée" : stressScore > 0.3 ? "Modérée" : "Faible",
      },
    ];
    if (wantsCouple)
      detected.push({ icon: "heart", label: "Connexion couple", val: "Distance émotionnelle" });
    else if (/image corporelle/i.test(context))
      detected.push({ icon: "users", label: "Image de soi", val: "Auto-jugement actif" });
    else if (/performance/i.test(context))
      detected.push({ icon: "spark", label: "Pression de performance", val: "Cycle anxieux" });
    else if (d < 5)
      detected.push({ icon: "heart", label: "Désir", val: d < 3 ? "En sourdine" : "En attente d'un déclic" });
    else if (e >= 7)
      detected.push({ icon: "bolt", label: "Énergie", val: "Bon réservoir" });

    // ===== Hero Expériences =====
    let hero;
    if (wantsCouple) {
      hero = { tag: "DOMAINE DE CHANTILLY × DUO", title: "Reconnexion Sensorielle", sub: "Bain duo, massage simultané et dîner cocon — pensé pour recréer le contact." };
    } else if (/image corporelle/i.test(context)) {
      hero = { tag: "AIME × RITUEL SOLO", title: "Journée Toi", sub: "Spa privatisé, soin signature et atelier d'écriture intime — réapprendre à s'habiter." };
    } else if (/performance|anxi[ée]t[ée]/i.test(context)) {
      hero = { tag: "MIRAVAL × DÉCOMPRESSION", title: "Pause Sans Performance", sub: "Cabane forêt, sauna et yin yoga duo — une nuit hors du temps, sans attente." };
    } else if (sleepDebt > 0.55) {
      hero = { tag: "MORPHÉE × SLEEP RETREAT", title: "Nuit Réparatrice", sub: "Chambre cocon, infusion adaptogène et méditation guidée — récupérer pour de vrai." };
    } else {
      hero = { tag: "MAMA SHELTER × ÉVASION", title: "Escapade Sensorielle", sub: "Une nuit pensée pour reconnecter — dîner, massage duo et accès privatisé au spa." };
    }

    return { profileLabel, profileBlurb, mood, tip, insight, planEmphasis, detected, hero, stressScore, sleepDebt };
  }

  /* ---------- experiences-catalog.ts (sous-ensemble représentatif) ---------- */
  const EXPERIENCES = [
    { id: "med-sleep-stress", title: "Méditation guidée — Soirs de stress", desc: "Relâche la tension accumulée et prépare ton corps au repos.", category: "Méditation", format: "Audio", duration: "12 min", durationMin: 12, premium: false, icon: "moon", bg: "linear-gradient(135deg, #6FA8DC 0%, #4A1F4D 100%)", indications: ["stress", "sleep_low"] },
    { id: "med-body-scan", title: "Body scan — Présence sensorielle", desc: "20 minutes pour reconnecter chaque zone de ton corps.", category: "Méditation", format: "Audio", duration: "20 min", durationMin: 20, premium: false, icon: "spark", bg: "linear-gradient(135deg, #FFCB3D 0%, #B21D27 100%)", indications: ["body_image", "performance_anxiety", "exploration"] },
    { id: "med-sensual-awareness", title: "Conscience sensorielle érotique", desc: "Réveiller progressivement la cartographie du plaisir.", category: "Méditation", format: "Audio", duration: "25 min", durationMin: 25, premium: true, icon: "spark", bg: "linear-gradient(135deg, #FFB3A0 0%, #B21D27 100%)", indications: ["desire_low", "performance_anxiety", "exploration"] },
    { id: "breath-coherence", title: "Cohérence cardiaque guidée", desc: "5 respirations par minute pour réduire le cortisol.", category: "Respiration", format: "Audio", duration: "5 min", durationMin: 5, premium: false, icon: "wave", bg: "linear-gradient(135deg, #FF7671 0%, #B21D27 100%)", indications: ["stress", "performance_anxiety", "energy_low"] },
    { id: "breath-478", title: "Respiration 4-7-8", desc: "La technique d'endormissement la plus rapide.", category: "Respiration", format: "Exercice", duration: "3 min", durationMin: 3, premium: false, icon: "wave", bg: "linear-gradient(135deg, #6FA8DC 0%, #2D0A2E 100%)", indications: ["sleep_low", "stress", "performance_anxiety"] },
    { id: "solo-self-touch", title: "Self-touch mindful", desc: "Explorer son corps sans objectif, en pleine conscience.", category: "Solo", format: "Pratique", duration: "20 min", durationMin: 20, premium: false, icon: "heart", bg: "linear-gradient(135deg, #FFB3A0 0%, #B21D27 100%)", indications: ["desire_low", "performance_anxiety", "body_image", "exploration"] },
    { id: "solo-pleasure-map", title: "Carte du plaisir personnel", desc: "Identifier ses zones et préférences sans pression.", category: "Solo", format: "Pratique", duration: "30 min", durationMin: 30, premium: true, icon: "compass", bg: "linear-gradient(135deg, #B21D27 0%, #4A1F4D 100%)", indications: ["exploration", "desire_low", "body_image"] },
    { id: "couple-sensate-1", title: "Sensate Focus — Niveau 1", desc: "Toucher non-exigeant pour reconnecter.", category: "Couple", format: "Exercice", duration: "20 min", durationMin: 20, premium: true, icon: "heart", bg: "linear-gradient(135deg, #B21D27 0%, #FF7671 100%)", indications: ["performance_anxiety", "couple_disconnect", "desire_low"], partneredOnly: true },
    { id: "couple-3-questions", title: "Rituel des 3 questions", desc: "Renforce l'intimité émotionnelle hebdomadaire.", category: "Couple", format: "Exercice", duration: "15 min", durationMin: 15, premium: false, icon: "users", bg: "linear-gradient(135deg, #FFB3A0 0%, #B21D27 100%)", indications: ["couple_disconnect", "communication"], partneredOnly: true },
    { id: "couple-hug-meditation", title: "Hugging meditation — 20 secondes", desc: "Une étreinte qui libère l'ocytocine.", category: "Couple", format: "Exercice", duration: "2 min", durationMin: 2, premium: false, icon: "heart", bg: "linear-gradient(135deg, #FF7671 0%, #FFCB3D 100%)", indications: ["couple_disconnect", "stress"], partneredOnly: true },
    { id: "couple-desire-map", title: "Carte du désir partagée", desc: "Cartographier envies, limites et fantasmes.", category: "Couple", format: "Exercice", duration: "45 min", durationMin: 45, premium: true, icon: "compass", bg: "linear-gradient(135deg, #4A1F4D 0%, #B21D27 100%)", indications: ["communication", "desire_low", "couple_disconnect"], partneredOnly: true },
    { id: "nrg-nsdr", title: "NSDR — Récupération profonde", desc: "Récupère l'énergie d'une sieste en 20 minutes.", category: "Énergie", format: "Audio", duration: "20 min", durationMin: 20, premium: false, icon: "bolt", bg: "linear-gradient(135deg, #FFCB3D 0%, #E8A923 100%)", indications: ["energy_low", "stress"] },
    { id: "edu-reactive-desire", title: "Le désir réactif — comprendre", desc: "Pourquoi attendre l'envie est contre-productif.", category: "Éducation", format: "Lecture", duration: "5 min", durationMin: 5, premium: false, icon: "brain", bg: "linear-gradient(135deg, #4A1F4D 0%, #2D0A2E 100%)", indications: ["desire_low", "general"] },
    { id: "edu-arousal-types", title: "Excitation spontanée vs réactive", desc: "Les deux modèles d'arousal selon Basson.", category: "Éducation", format: "Lecture", duration: "7 min", durationMin: 7, premium: false, icon: "brain", bg: "linear-gradient(135deg, #FF7671 0%, #B21D27 100%)", indications: ["desire_low", "general"] },
    { id: "edu-cortisol-desire", title: "Cortisol et désir — la science", desc: "Comment le stress chronique inhibe la libido.", category: "Éducation", format: "Lecture", duration: "8 min", durationMin: 8, premium: false, icon: "brain", bg: "linear-gradient(135deg, #FFCB3D 0%, #E8A923 100%)", indications: ["stress", "desire_low", "general"] },
    { id: "jrn-desire-journal", title: "Journal du désir", desc: "Tracer ce qui éveille, ce qui éteint.", category: "Journaling", format: "Exercice", duration: "5 min/jour", durationMin: 5, premium: false, icon: "brain", bg: "linear-gradient(135deg, #FFCB3D 0%, #E8A923 100%)", indications: ["desire_low", "exploration", "general"] },
    { id: "esc-mama-shelter", title: "Week-end Mama Shelter", desc: "Hôtel design vibrant, rooftop, bar à cocktails.", category: "Escapade", format: "Sortie", duration: "1-2 nuits", durationMin: 720, premium: false, icon: "moon", bg: "linear-gradient(135deg, #FFCB3D 0%, #E8A923 100%)", indications: ["couple_disconnect", "stress", "general"], partneredOnly: true },
    { id: "esc-love-room", title: "Love Room — Suite avec jacuzzi", desc: "Une nuit, un jacuzzi, zéro distraction.", category: "Escapade", format: "Sortie", duration: "1 nuit", durationMin: 600, premium: false, icon: "spark", bg: "linear-gradient(135deg, #B21D27 0%, #4A1F4D 100%)", indications: ["couple_disconnect", "desire_low"], partneredOnly: true },
    { id: "esc-spa-duo", title: "Spa duo / Hammam à deux", desc: "2-3h de soins en cabine partagée.", category: "Escapade", format: "Sortie", duration: "3 h", durationMin: 180, premium: false, icon: "wave", bg: "linear-gradient(135deg, #A6CFEC 0%, #6FA8DC 100%)", indications: ["couple_disconnect", "stress", "body_image"], partneredOnly: true },
  ];

  function profileSignals(intake, quiz) {
    const partnered = isPartnered(quiz);
    const barrier = (quiz.mainBarrier || "").toLowerCase();
    const goal = (quiz.goal || "").toLowerCase();
    return {
      partnered,
      mainBarrier: quiz.mainBarrier,
      sleepLow: /l[ée]ger|mauvais|irr[ée]gulier/.test((quiz.sleepQuality || quiz.sleep || "").toLowerCase()),
      energyLow: (intake.energy != null ? intake.energy : 5) <= 4 || /tous les jours|souvent/.test((quiz.eveningEnergy || "").toLowerCase()),
      desireLow: (intake.desire != null ? intake.desire : 5) <= 4 || /absent|faible/.test((quiz.currentDesire || "").toLowerCase()),
      stressHigh: (intake.zen != null ? intake.zen : 5) <= 4 || /[ée]puis|tendu/.test((quiz.globalMood || "").toLowerCase()),
      performanceAnxiety: /performance|anxi[ée]t[ée]/.test(barrier) || /performance/.test(goal),
      bodyImageConcern: /image|corps/.test(barrier),
      coupleDisconnect: partnered && (/tensions|couple|reconnecter/.test(barrier + " " + goal) || /gros [ée]cart|pas vraiment/i.test(quiz.desireGap || "")),
      communicationConcern: partnered && (/communiquer/.test(goal) || /jamais|rarement/i.test(quiz.communication || "")),
    };
  }

  function scoreExperience(exp, signals) {
    if (exp.partneredOnly && !signals.partnered) return -1;
    if (exp.soloOnly && signals.partnered) return -1;
    let score = 0;
    for (const ind of exp.indications) {
      switch (ind) {
        case "stress": if (signals.stressHigh) score += 22; break;
        case "sleep_low": if (signals.sleepLow) score += 22; break;
        case "energy_low": if (signals.energyLow) score += 22; break;
        case "desire_low": if (signals.desireLow) score += 22; break;
        case "performance_anxiety": if (signals.performanceAnxiety) score += 28; break;
        case "body_image": if (signals.bodyImageConcern) score += 28; break;
        case "couple_disconnect": if (signals.coupleDisconnect) score += 28; break;
        case "communication": if (signals.communicationConcern) score += 22; break;
        case "exploration": score += 4; break;
        case "general": score += 2; break;
      }
    }
    if (signals.partnered && exp.category === "Couple") score += 4;
    if (!signals.partnered && exp.category === "Solo") score += 6;
    if (signals.sleepLow && exp.category === "Méditation" && exp.durationMin <= 20) score += 4;
    return Math.min(100, score);
  }

  function rankExperiences(intake, quiz) {
    const signals = profileSignals(intake, quiz);
    const scored = EXPERIENCES.map((exp) => ({ exp, score: scoreExperience(exp, signals) })).filter((e) => e.score >= 0);
    scored.sort((a, b) => b.score - a.score);
    const topForYou = [];
    for (const s of scored) {
      if (topForYou.length >= 6) break;
      if (s.score < 12) break;
      topForYou.push(s.exp);
    }
    if (topForYou.length > 0 && topForYou.every((e) => e.premium)) {
      const firstFree = scored.find((s) => !s.exp.premium && s.score > 0);
      if (firstFree) topForYou[topForYou.length - 1] = firstFree.exp;
    }
    const byCategory = {};
    for (const s of scored) {
      const c = s.exp.category;
      if (!byCategory[c]) byCategory[c] = [];
      byCategory[c].push(s.exp);
    }
    return { topForYou, byCategory };
  }

  global.XEngine = { isPartnered, computeScore, getRecos, rankExperiences, EXPERIENCES };
})(window);
