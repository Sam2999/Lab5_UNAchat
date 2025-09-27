// Librerías
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Inicialización
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Validación del lado servidor
const validation = require('./libs/unalib');

const port = process.env.PORT || 3000;

// Servir estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// HTML raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Pequeño helper para escapar ángulos si necesitamos devolver texto plano
function escapeAngles(s) {
  return String(s).replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
}

// Socket.IO
io.on('connection', (socket) => {
  console.log('[socket] conectado');

  socket.on('Evento-Mensaje-Server', (msgStr) => {
    console.log('[socket] recibido (crudo):', msgStr);

    // Llega como string JSON desde el cliente
    let parsed;
    try {
      parsed = JSON.parse(msgStr);
    } catch (e) {
      console.error('[socket] JSON inválido:', e.message);
      socket.emit('Evento-Mensaje-Rechazado', { error: 'json_invalido' });
      return;
    }

    // Validar/normalizar para mitigar XSS
    const safe = validation.validateMessage(parsed);
    if (!safe || safe.error) {
      const motivo = (safe && safe.error) || 'contenido_peligroso';
      console.warn('[socket] mensaje bloqueado por seguridad:', motivo);

      // 1) Notificar SOLO al emisor el motivo del bloqueo
      socket.emit('Evento-Mensaje-Rechazado', { error: motivo });

      // 2) (Opcional/útil en el lab) Enviar un mensaje de sistema visible al emisor
      //    para que SIEMPRE se vea una reacción.
      const nota = JSON.stringify({
        nombre: 'Sistema',
        color: '#b00020',
        mensaje: `Mensaje bloqueado por seguridad (${motivo}).`
      });
      socket.emit('Evento-Mensaje-Server', nota);
      return;
    }

    // Reenviar a todos en el formato que el cliente espera (string JSON)
    const out = JSON.stringify({
      nombre: safe.nombre,
      color: safe.color,
      mensaje: safe.mensaje
    });

    console.log('[socket] reenviando (seguro):', out);
    io.emit('Evento-Mensaje-Server', out);
  });

  socket.on('disconnect', () => console.log('[socket] desconectado'));
});

// Levantar servidor
server.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});
