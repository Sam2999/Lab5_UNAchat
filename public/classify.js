// public/js/classify.js
(function (window) {
  const IMG_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;
  const VID_EXT = /\.(mp4|webm|ogg)$/i;
  const YT = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:[&#?].*)?$/i;
  const VIMEO = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:[&#?].*)?$/i;

  function classify(raw) {
    const text = String(raw || "").trim().slice(0, 500);
    if (!/^https?:\/\//i.test(text)) return { type: "text", text };

    let u;
    try { u = new URL(text); }
    catch { return { type: "text", text }; }

    if (!["http:", "https:"].includes(u.protocol)) return { type: "text", text };

    if (IMG_EXT.test(u.pathname)) return { type: "image", url: u.href };
    if (VID_EXT.test(u.pathname)) return { type: "video", kind: "file", src: u.href };

    const m1 = text.match(YT);
    if (m1) return { type: "video", kind: "youtube", id: m1[1] };

    const m2 = text.match(VIMEO);
    if (m2) return { type: "video", kind: "vimeo", id: m2[1] };

    return { type: "link", url: u.href };
  }

  function escapeAngles(s) {
    return String(s).replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"));
  }

  window.ChatClassifier = { classify, escapeAngles };
})(window);
