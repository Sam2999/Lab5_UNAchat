// libs/unalib.js

// Patrones simples para validaciones
const FORBIDDEN = /(javascript:|data:text\/html|<\s*script\b|on\w+\s*=)/i;

function trimMax(s, n) {
  return String(s || '').trim().slice(0, n);
}

// ===== Validaciones utilitarias =====
function is_valid_phone(phone) {
  try {
    const re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/i;
    return re.test(String(phone || ''));
  } catch { return false; }
}

function is_valid_url_image(url) {
  try {
    const re = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|png|gif|bmp|webp|svg)$/i;
    return re.test(String(url || ''));
  } catch { return false; }
}

function is_valid_video_file(url) {
  try {
    const re = /(http(s?):)([/|.|\w|\s|-])*\.(?:mp4|webm|ogg)$/i;
    return re.test(String(url || ''));
  } catch { return false; }
}

function is_valid_yt_video(url) {
  try {
    // Devuelve true si parece un enlace válido de YouTube
    const re = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})(?:[&#?].*)?$/i;
    return re.test(String(url || ''));
  } catch { return false; }
}

function getYTVideoId(url) {
  const m = String(url || '').match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  return m ? m[1] : null;
}

// ===== Normalización principal =====
/**
 * validateMessage
 * @param {object|string} input  Objeto { nombre, mensaje, color } o string JSON con esas props
 * @returns {{nombre:string,color:string,mensaje:string}|{error:string}}
 */
function validateMessage(input) {
  let obj = input;

  // Acepta string JSON por compatibilidad
  if (typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch {
      return { error: 'json_invalido' };
    }
  }

  // Campos base
  const nombre = trimMax(obj?.nombre, 40) || 'Anonimo';
  const color  = trimMax(obj?.color, 7);   // ej. "#A1B2C3"
  const rawMsg = trimMax(obj?.mensaje, 500);

  // Bloqueo básico XSS
  if (!rawMsg || FORBIDDEN.test(rawMsg)) {
    return { error: 'contenido_peligroso' };
  }

  // No devolvemos HTML. Sólo el texto normalizado.
  // La UI (index + classify.js) se encarga de renderizar imagen/video/links de forma segura.
  return {
    nombre,
    color,
    mensaje: rawMsg
  };
}

module.exports = {
  // utilitarias (por si las usas en otro lado)
  is_valid_phone,
  is_valid_url_image,
  is_valid_video_file,
  is_valid_yt_video,
  getYTVideoId,

  // principal
  validateMessage,
};
