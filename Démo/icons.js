/* ============================================================
   X-plorer — DÉMO : icônes
   Portage fidèle de x-plorer-app/src/components/ui/Icon.tsx
   icon(name, { size, strokeWidth, fill }) -> chaîne SVG
   ============================================================ */
(function (global) {
  const PATHS = {
    "arrow-left": '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-right": '<path d="m9 6 6 6-6 6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    sparkles:
      '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    spark:
      '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
    brain:
      '<path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V3a3 3 0 0 0-3 0z"/><path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="M5 12.5 10 17l9-10"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    heart:
      '<path d="M20.4 4.6a5.5 5.5 0 0 0-7.8 0L12 5.2l-.6-.6a5.5 5.5 0 0 0-7.8 7.8l.6.6L12 21l7.8-7.8.6-.6a5.5 5.5 0 0 0 0-7.8z"/>',
    flame: '<path d="M12 2c1 4 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 1-3s2 2 3-1 0-5 0-5z"/>',
    wave: '<path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-6 2 2-6 6-2z"/>',
    users:
      '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="8" r="2.5"/><path d="M22 18a4.5 4.5 0 0 0-5-4.4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    lightbulb:
      '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.8.7 1 1.4 1 2.3v1h6v-1c0-.9.2-1.6 1-2.3A7 7 0 0 0 12 2z"/>',
    star: '<path d="M12 3 14.7 9l6.3.5-4.8 4.2 1.5 6.3L12 16.8 6.3 20l1.5-6.3L3 9.5 9.3 9 12 3z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  };

  function icon(name, opts) {
    opts = opts || {};
    const size = opts.size || 22;
    const strokeWidth = opts.strokeWidth || 2;
    const fill = opts.fill || "none";
    const body = PATHS[name];
    if (!body) return "";
    // "play" is filled in the prototype
    const isFilled = name === "play";
    const stroke = isFilled ? "none" : "currentColor";
    const f = isFilled ? "currentColor" : fill;
    return (
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${f}" ` +
      `stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" ` +
      `stroke-linejoin="round" aria-hidden="true">${body}</svg>`
    );
  }

  global.XIcon = icon;
})(window);
