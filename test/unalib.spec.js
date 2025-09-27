const unalib = require('../libs/unalib');

describe('unalib.validateMessage', () => {
  test('acepta objeto con texto simple (sin HTML)', () => {
    const out = unalib.validateMessage({ nombre: 'Ana', color: '#A1B2C3', mensaje: 'Hola mundo' });
    expect(out).toEqual({ nombre: 'Ana', color: '#A1B2C3', mensaje: 'Hola mundo' });
  });

  test('recorta y normaliza campos (nombre<=40, mensaje<=500)', () => {
    const largo = 'x'.repeat(600);
    const out = unalib.validateMessage({ nombre: largo, color: '#123456', mensaje: largo });
    expect(out.nombre.length).toBeLessThanOrEqual(40);
    expect(out.mensaje.length).toBeLessThanOrEqual(500);
  });

  test('pone Anonimo si nombre es vacío', () => {
    const out = unalib.validateMessage({ nombre: '', color: '#111111', mensaje: 'hola' });
    expect(out.nombre).toBe('Anonimo');
  });

  test('rechaza payload peligroso con <script>', () => {
    const out = unalib.validateMessage({ nombre: 'Ana', color: '#A1B2C3', mensaje: '<script>alert(1)</script>' });
    expect(out).toEqual({ error: 'contenido_peligroso' });
  });

  test('rechaza payload con javascript: URL', () => {
    const out = unalib.validateMessage({ nombre: 'Ana', color: '#A1B2C3', mensaje: 'javascript:alert(1)' });
    expect(out).toEqual({ error: 'contenido_peligroso' });
  });

  test('acepta JSON string válido (compatibilidad con server.js)', () => {
    const input = JSON.stringify({ nombre: 'Luis', color: '#FF00AA', mensaje: 'https://site.com/foto.png' });
    const out = unalib.validateMessage(input);
    // El servidor/cliente se encargan del render; aquí sólo confirmamos que no rechaza
    expect(out).toEqual({ nombre: 'Luis', color: '#FF00AA', mensaje: 'https://site.com/foto.png' });
  });

  test('rechaza JSON inválido', () => {
    const out = unalib.validateMessage('{"nombre": "X"'); // JSON roto
    expect(out).toEqual({ error: 'json_invalido' });
  });
});

describe('unalib utils', () => {
  test('is_valid_url_image reconoce extensiones de imagen', () => {
    expect(unalib.is_valid_url_image('http://a.com/foto.jpg')).toBe(true);
    expect(unalib.is_valid_url_image('https://a.com/foto.PNG')).toBe(true);
    expect(unalib.is_valid_url_image('https://a.com/foto.webp')).toBe(true);
    expect(unalib.is_valid_url_image('https://a.com/foto.txt')).toBe(false);
  });

  test('is_valid_video_file reconoce .mp4/.webm/.ogg', () => {
    expect(unalib.is_valid_video_file('https://cdn.com/vid.mp4')).toBe(true);
    expect(unalib.is_valid_video_file('https://cdn.com/vid.webm')).toBe(true);
    expect(unalib.is_valid_video_file('https://cdn.com/vid.ogg')).toBe(true);
    expect(unalib.is_valid_video_file('https://cdn.com/vid.mov')).toBe(false);
  });

  test('is_valid_yt_video reconoce URLs de YouTube y extrae ID', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(unalib.is_valid_yt_video(url)).toBe(true);
    expect(unalib.getYTVideoId(url)).toBe('dQw4w9WgXcQ');
  });
});
