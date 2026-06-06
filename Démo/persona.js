/* ============================================================
   X-plorer — DÉMO : profil test (persona)
   « Léa, 38 ans » — femme en couple qui veut mieux comprendre son désir.
   Les réponses produisent, via le vrai moteur (XEngine), un X-Score de 60,
   un profil « À réveiller » et un insight centré sur le désir.
   Voir persona.md pour la fiche détaillée.
   ============================================================ */
(function (global) {
  // Réponses au quiz (mêmes clés que x-plorer-app QuizAnswers)
  const quizAnswers = {
    age: "35–44",
    gender: "Femme",
    relationship: "En couple",
    relationshipDuration: "Plus de 7 ans",
    lifeContext: ["Travail intense", "Enfants en bas âge"],

    globalMood: "Plutôt stable",
    stressSource: "Plusieurs choses à la fois",
    sleepQuality: "Correct mais perfectible",
    bedtime: "23h – minuit",
    screenEvening: "Souvent",
    eveningEnergy: "Parfois (1–3 jours/semaine)",

    currentDesire: "Faible",
    desireGap: "Pas vraiment",
    initiation: "Plus souvent mon/ma partenaire",
    communication: "Parfois",
    mainBarrier: "Manque de désir tout court",

    lifeEvent: "Naissance d'un enfant",
    therapySupport: "Non",
    medication: "Non",

    goal: "Comprendre ce qui bloque",
    vision: "J'ai retrouvé du désir",
  };

  // Profil affiché (équivalent UserProfile du store)
  const profile = {
    initial: "L",
    name: "Léa",
    email: "lea.martin@email.com",
    age: "35–44",
    gender: "Femme",
    relationship: "En couple",
    memberSince: "2026",
    checkins: 5,
    streak: 4,
    goals: ["Comprendre ce qui bloque", "J'ai retrouvé du désir"],
  };

  // Historique de score amorcé (progression) pour la sparkline.
  // La dernière entrée (60) correspond au bilan calculé ci-dessous.
  const scoreHistory = [
    { date: "2026-04-28", score: 49, tag: "Bilan initial" },
    { date: "2026-05-05", score: 52 },
    { date: "2026-05-12", score: 55 },
    { date: "2026-05-19", score: 57 },
    { date: "2026-05-26", score: 60, tag: "Bilan" },
  ];

  global.XPersona = { quizAnswers, profile, scoreHistory };
})(window);
