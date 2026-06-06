/* ============================================================
   X-plorer — LANDING : préinscription
   Logique reprise de « Lab landing page/src/index.html » :
   insertion dans la table Supabase `waitlist` (projet existant).
   ============================================================ */
(function () {
  "use strict";

  // ─── Config Supabase (projet existant de la Lab landing) ───
  const SUPABASE_URL = "https://ifzasupbzikcoyxmevec.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmemFzdXBiemlrY295eG1ldmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMjI5ODEsImV4cCI6MjA5MDg5ODk4MX0.KiObDqti48-Xyilq0a79qd475hNS0b7BX4W7FKl2izg";
  const CONSENT_VERSION = "v1.0";
  // La table `waitlist` impose variant ∈ {A, B} ; pas d'A/B test ici → 'A' constant.
  const VARIANT = "A";

  // ─── Hydratation des icônes (spans [data-icon]) ───
  function hydrateIcons() {
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      const name = el.getAttribute("data-icon");
      const size = parseInt(el.getAttribute("data-size") || "16", 10);
      if (window.XIcon) el.innerHTML = window.XIcon(name, { size: size });
    });
  }

  // ─── Init Supabase ───
  let supabaseClient = null;
  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (e) {
    console.warn("[X-plorer] Supabase non initialisé :", e.message);
  }

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    hydrateIcons();

    const form = document.getElementById("signup-form");
    const emailInput = document.getElementById("email-input");
    const checkbox = document.getElementById("consent-checkbox");
    const submitBtn = document.getElementById("submit-btn");
    const formMessage = document.getElementById("form-message");
    const counterEl = document.getElementById("social-proof-counter");
    if (!form) return;

    // Compteur social proof (indicatif, local)
    let count = parseInt(localStorage.getItem("xplorer_count") || "312", 10);
    if (counterEl) counterEl.textContent = count + " personnes déjà préinscrites";

    checkbox.addEventListener("change", function () {
      submitBtn.disabled = !checkbox.checked;
    });

    function showMessage(type, text) {
      formMessage.className = "form-message " + type + " visible";
      formMessage.textContent = text;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim().toLowerCase();

      if (!checkbox.checked) {
        showMessage("error", "Merci d'accepter les conditions pour continuer.");
        return;
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        showMessage("error", "Saisis une adresse email valide.");
        emailInput.focus();
        return;
      }

      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.innerHTML = "Préinscription en cours…<span class='spinner'></span>";
      formMessage.className = "form-message";

      try {
        if (!supabaseClient) throw { code: "NO_CLIENT" };

        const { error } = await supabaseClient.from("waitlist").insert({
          email: email,
          variant: VARIANT,
          consent_given: true,
          consent_version: CONSENT_VERSION,
        });
        if (error) throw error;

        count++;
        localStorage.setItem("xplorer_count", String(count));
        if (counterEl) counterEl.textContent = count + " personnes déjà préinscrites";
        form.style.display = "none";
        showMessage("success", "Tu es sur la liste ✨ On te contacte en avant-première au lancement.");
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        if (err && (err.code === "23505" || (err.message && /duplicate|unique/i.test(err.message)))) {
          form.style.display = "none";
          showMessage("success", "Tu es déjà sur la liste ✨ On te tient au courant.");
        } else if (err && err.code === "NO_CLIENT") {
          showMessage("error", "Service momentanément indisponible. Réessaie dans un instant.");
          console.error("[X-plorer] Supabase client non initialisé.");
        } else {
          showMessage("error", "Une erreur est survenue. Réessaie.");
          console.error("[X-plorer] Form error:", err);
        }
      }
    });
  });
})();
