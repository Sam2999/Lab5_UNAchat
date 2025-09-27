// npm install para descargar los paquetes...

// librerías
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

// tu lib de validación
const validation = require('./libs/unalib');

const port = process.env.PORT || 3000;

// 1) servir archivos estáticos (para /js/classify.js, css, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// 2) root: presentar html
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 3) escuchar una conexion por socket
io.on('connection', function(socket){

  socket.on('Evento-Mensaje-Server', function(msgStr){
    // Tus clientes envían un string JSON. Ej: {"nombre":"...","mensaje":"...","color":"#FF00AA"}
    let parsed;
    try {
      parsed = JSON.parse(msgStr);
    } catch (e) {
      return; // descartar si no es JSON válido
    }

    // 4) Normalizar/validar el mensaje (anti-XSS básico, long máx, etc.)
    const safe = validation.validateMessage(parsed);
    if (!safe || safe.error) {
      return; // descartar contenido peligroso
    }

    // 5) Re-emite SIEMPRE un string JSON (tu cliente hace JSON.parse(msg))
    const out = JSON.stringify({
      nombre: safe.nombre,
      color: safe.color,
      mensaje: safe.mensaje
    });

    io.emit('Evento-Mensaje-Server', out);
  });

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
