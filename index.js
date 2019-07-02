console.log("Iniciando sistema de gestión de la linea 130...");

// requires básicos
const path = require('path');                 // para facilitar el manejo de rutas del sistema de archivos
const fs = require('fs');                     // para manejo de archivos
const express = require('express');           // servidor HTTP
const { Pool } = require('pg');               // conector a PostgreSQL
const bodyParser = require('body-parser');    // para manejar POST requests (trabajar con datos de input forms como JSON)
const shapefile = require('shapefile');       // para leer shapefiles
const session = require('express-session');   // manejo de sesiones en express
const passport = require('passport');         // lib para estrategias de inicio de sesión
const LocalStrategy = require('passport-local').Strategy;   // estrategia de inicio de sesión local de passport

// algunas variables de entorno.
// TO DO: mover a .env y leer a través de "process.env.VARIABLE"
const http_port = 5000;
const pg_port = 7775;
const logfile_path = "./log.txt";
const app_secret = 'itsrainingcatsanddogs';

// instanciado de Express (establecimiento del HTTP request handler)
const app = express();

// establecimiento del motor de vistas "EJS"
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(session({ secret: app_secret }));
app.use(express.static(path.join(__dirname, 'public'))); // configuración del directorio público
app.use(bodyParser.json()); // configurar body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function (username, password, done) {
    if (username == 'admin' && password == 'admin') {
      return done(null, { id: 'admin', name: 'admin' });
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, JSON.stringify(user));
});

passport.deserializeUser(function (user, done) {
  done(null, JSON.parse(user));
});

app.use(function (request, response, next) {
  console.log('URL: ' + request.url);
  next();
});
// ===================================================
// ============= CONFIGURACIÓN DE RUTAS ==============
// ===================================================

// homepage con información sobre el servicio
app.get('/', (req, res) => res.render('pages/index')); // done
app.get('/index', (req, res) => res.render('pages/index')); // done

// rutas de login
app.get('/login', (req, res) => res.render('pages/login/login-form')); // ui done
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  //failureFlash: true
}));

// llamar esto en todas las rutas que requieran autenticación
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// rutas de signup
app.get('/signup', (req, res) => res.render('pages/signup/signup-form'));
app.post('/signup',(req,res) => {
  console.log(JSON.stringify(req.body));
  console.log(req.body.username);
  console.log(req.body.password);
  console.log(req.body.email);
  res.redirect('/signup/verify');
});
app.get('/signup/verify', (req, res) => res.render('pages/signup/verify'));

// rutas de faq
app.get('/faq', (req, res) => res.render('pages/faq/index'));

// rutas de forgot-password
app.get('/forgot-password', (req, res) => res.render('pages/forgot-password/request-form'));
app.get('/forgot-password/request-form', (req, res) => res.render('pages/forgot-password/request-form'));
app.get('/forgot-password/verify', (req, res) => res.render('pages/forgot-password/verify'));
app.get('/forgot-password/confirm', (req, res) => res.render('pages/forgot-password/confirm'));


// rutas sobre gestion de choferes (autenticar)


// rutas sobre gestión de micros (autenticar)


// rutas sobre gestión de las rutas de transporte (autenticar)


// rutas sobre gestión de puntos de control (autenticar)


// rutas sobre gestión de asistencia, retrasos, multas, etc (autenticar)



// levantar servidor, escuchando en el puerto anteriormente establecido
const server = app.listen(http_port, () => {
  console.log(`Servidor escuchando en el puerto ${http_port}`)
});

/* ======================================================= */
/* =================== shapefile demo ==================== */
/* ======================================================= */

// página para mostrar el mapa
app.get('/shapefile', (req, res) => res.render('pages/shapefile'));

// servicio REST/JSON que responde un GeoJSON
app.get('/get-geojson', (req, res) => {
  shapefileRequestHandler(req, res);
});

/* ======================================================= */
/* ================= socket.io chat demo: ================ */
/* ======================================================= */

// página para mostrar el form de chat
app.get('/chat', isAuthenticated, (req, res) => {
  res.render('pages/chat');
});

// página para mostrar el seguimiento en tiempo real en mapa
app.get('/tracking', (req, res) => {
  res.render('pages/tracking');
});

// handler de socket.io (requiere instanciar con un servidor http)
const io = require('socket.io')(server);

// espacio de nombres "tech"
const nsp = io.of('/tech');

// escuchar como servidor
nsp.on('connection', (socket) => {
  socket.on('join', (data) => {
    console.log(`user joined: ${data.uname}@${data.room}`);
    socket.join(data.room);
    nsp.in(data.room).emit('message', `El usuario ${data.uname} se ha unido a la sala ${data.room}!`);
  });

  // registrar el mensaje recibido en la consola y emitir a todos
  // los clientes conectados a la misma sala
  socket.on('message', (obj) => {
    console.log(`[MSG] Received in "${obj.room}" from "${obj.uname}": "${obj.msg}"`);
    nsp.in(obj.room).emit('message', `${obj.uname} says: ${obj.msg}`);
  });

  // data: { room: 'tracking', pointLatLon: {lat: -17.x, lon: -63.x}
  socket.on('location', (data) => {
    nsp.in(data.room).emit('location', data.pointLatLon);
  });


  socket.on('disconnect', () => {
    console.log('user disconnected');
    // emitir a todo el namespace
    nsp.emit('message', 'user disconnected');
  });
});


// manejando rutas no definidas -> tirar un 404
app.get('*', (req, res) => {
  res.status(404).render('pages/404');
  log(`404: Solicitud para ruta no válida: ${req.url}`);
});

// ===================================================
// ============ /CONFIGURACIÓN DE RUTAS ==============
// ===================================================


function shapefileRequestHandler(req, res) {
  shapefile.open("./shapefiles/ruta - linea 130.shp")
    .then((source) => source.read()
      .then(function log(result) {
        if (result.done) return;
        console.log('Shapefile procesado a GeoJson!');
        res.send(result.value);
        return source.read().then(log);
      }))
    .catch((error) => console.error(error.stack));
}


/**
 * Registra el texto pasado como parámetro tanto en la consola como
 * en el archivo de texto referenciado por 'logfile_path'
 * @param text el texto a ser registrado en el log
 */
function log(text) {
  // obtener el tiempo en formato: YYYY:MM:DD:HH:MM:SS
  const cur_time = (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');
  const log_text = cur_time + ": " + text + '\n';
  console.log(text);
  fs.appendFile(logfile_path, log_text, (err) => {
    if (err) {
      console.error('Error al escribir al archivo log: ' + err)
    }
  });
}