// public/js/classify.js
(function (window) {
  // Acepta extensión con querystring opcional
  const IMG_EXT = /\.(png|jpe?g|gif|webp|svg)(?:\?.*)?$/i;
  const VID_EXT = /\.(mp4|webm|ogg)(?:\?.*)?$/i;
  const YT = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(?:[&#?].*)?$/i;

  function classify(raw) {
    const text = String(raw || "").trim().slice(0, 500);
    if (!/^https?:\/\//i.test(text)) {
      console.debug('[classify] text:', text);
      return { type: "text", text };
    }

    let u;
    try { u = new URL(text); }
    catch {
      console.debug('[classify] invalid URL, treat as text:', text);
      return { type: "text", text };
    }

    if (!["http:", "https:"].includes(u.protocol)) {
      console.debug('[classify] non-http(s), treat as text:', text);
      return { type: "text", text };
    }

    if (IMG_EXT.test(u.pathname + (u.search || ""))) {
      const out = { type: "image", url: u.href };
      console.debug('[classify] image:', out);
      return out;
    }

    if (VID_EXT.test(u.pathname + (u.search || ""))) {
      const out = { type: "video", kind: "file", src: u.href };
      console.debug('[classify] video file:', out);
      return out;
    }

    const m1 = text.match(YT);
    if (m1) {
      const out = { type: "video", kind: "youtube", id: m1[1] };
      console.debug('[classify] youtube:', out);
      return out;
    }

    const out = { type: "link", url: u.href };
    console.debug('[classify] link:', out);
    return out;
  }

  function escapeAngles(s) {
    return String(s).replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;"));
  }

  window.ChatClassifier = { classify, escapeAngles };
})(window);
