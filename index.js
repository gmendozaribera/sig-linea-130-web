console.log("Iniciando sistema de gestión de la linea 130...");

// requires básicos
const path = require('path');                 // para facilitar el manejo de rutas del sistema de archivos
const fs = require('fs');                     // para manejo de archivos
const express = require('express');           // servidor HTTP
const bodyParser = require('body-parser');    // para manejar POST requests (trabajar con datos de input forms como JSON)
const session = require('express-session');   // manejo de sesiones en express
const passport = require('passport');         // lib para estrategias de inicio de sesión
const LocalStrategy = require('passport-local').Strategy;   // estrategia de inicio de sesión local de passport
const procesadorShapefile = require('./procesador-shapefile');    // mi procesador de shapefiles :v
const models = require('./models');           //  los modelos Sequelize ORM

// algunas variables de entorno.
// TO DO: mover a .env y leer a través de "process.env.VARIABLE"
const http_port = process.env.PORT || 5000;
const app_secret = process.env.APP_SECRET;

// instanciado de Express (establecimiento del HTTP request handler)
const app = express();

// establecimiento del motor de vistas "EJS"
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(session({ secret: app_secret, resave: true, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public'))); // configuración del directorio público (assets)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

//  TO DO: autenticar usuarios en esta sección, por ahora solamente es una prueba de concepto.
passport.use(new LocalStrategy(
  function (username, password, done) {
    if (username == 'admin' && password == 'admin') {
      return done(null, { id: 'admin', name: 'admin' });
    } else {
      return done(null, false, { message: 'Incorrect password.' });
    }
  })
);

//  TO DO: guardar detalles del usuario
passport.serializeUser(function (user, done) {
  done(null, JSON.stringify(user));
});

//  TO DO: obtener los credenciales del usuario, usarlos para hacer un select
//  en la base de datos y obtener los datos completos del usuario
passport.deserializeUser(function (user, done) {
  done(null, JSON.parse(user));
});

//  establecer un pequeño middleware que escribe las solicitudes a la consola
app.use(function (request, response, next) {
  console.log('URL: ' + request.url);
  next();
});

// levantar servidor, escuchando en el puerto anteriormente establecido
const server = app.listen(http_port, () => {
  console.log(`Servidor escuchando en el puerto ${http_port}`)
});

// manejar la señal de terminación del programa
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => {
    console.log('Express HTTP server: Process terminated');
  });
});

// ===================================================
// ============= CONFIGURACIÓN DE RUTAS ==============
// ===================================================

// homepage con información sobre el servicio
app.get('/', (req, res) => res.render('pages/index'));
app.get('/index', (req, res) => res.render('pages/index'));

// rutas de login
app.get('/login', (req, res) => res.render('pages/login/login-form'));
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  //failureFlash: true // provoca excepción de método no implementado :(
}));

// llamar esto en todas las rutas que requieran autenticación
const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    if (req.path == '/login') {
      res.redirect('/');
    }
    return next();
  }
  res.redirect('/login');
}

// rutas de signup
app.get('/signup', (req, res) => res.render('pages/signup/signup-form'));
app.post('/signup', (req, res) => {
  console.log(JSON.stringify(req.body));
  console.log(req.body.username);
  console.log(req.body.password);
  console.log(req.body.email);
  res.redirect('/signup/verify');
});
app.get('/signup/verify', (req, res) => res.render('pages/signup/verify'));

// rutas de faq
app.get('/faq', (req, res) => {
  faq = fs.readFileSync('./faq.json').toString();
  res.render('pages/faq', { faq: JSON.parse(faq) })
});

// rutas de forgot-password
app.get('/forgot-password', (req, res) => res.render('pages/forgot-password/request-form'));
app.get('/forgot-password/request-form', (req, res) => res.render('pages/forgot-password/request-form'));
app.get('/forgot-password/verify', (req, res) => res.render('pages/forgot-password/verify'));
app.get('/forgot-password/confirm', (req, res) => res.render('pages/forgot-password/confirm'));

//  rutas sobre gestión de propietarios de buses (autenticar)
const propietarioController = require('./controllers/propietario');
app.get('/propietario/', (req, res) => { res.redirect('/propietario/index/') });
app.get('/propietario/index', (req, res) => { propietarioController.index(req, res) });
app.get('/propietario/create', (req, res) => { propietarioController.create(req, res) });
app.post('/propietario/create', (req, res) => { propietarioController.create(req, res) });
app.get('/propietario/view/:id', (req, res) => { propietarioController.view(req, res) });
app.get('/propietario/update/:id', (req, res) => { propietarioController.update(req, res) });
app.post('/propietario/update/', (req, res) => { propietarioController.update(req, res) });

// rutas sobre gestion de choferes (autenticar)
const choferController = require('./controllers/chofer');
app.get('/chofer/', (req, res) => { res.redirect('/chofer/index') });
app.get('/chofer/index/', (req, res) => { choferController.index(req, res) });
app.get('/chofer/create/', (req, res) => { choferController.create(req, res) });
app.post('/chofer/create/', (req, res) => { choferController.create(req, res) });
app.get('/chofer/view/:id', (req, res) => { choferController.view(req, res) });
app.get('/chofer/update/:id', (req, res) => { choferController.update(req, res) });
app.post('/chofer/update/', (req, res) => { choferController.update(req, res) });

// rutas sobre gestión de buses/micros (autenticar)
const busController = require('./controllers/bus');
app.get('/bus/', (req, res) => { res.redirect('/bus/index/') });
app.get('/bus/index/', (req, res) => { busController.index(req, res) });
app.get('/bus/create/', (req, res) => { busController.create(req, res) });
app.get('/bus/view/:id', (req, res) => { busController.view(req, res) });
app.get('/bus/update/:id', (req, res) => { busController.update(req, res) });
app.post('/bus/update/', (req, res) => { busController.update(req, res) });

// rutas sobre multas o sanciones (autenticar)
const multaController = require('./controllers/multa');
app.get('/multa/', (req, res) => { res.redirect('/multa/index/') });
app.get('/multa/index/', (req, res) => { multaController.index(req,res) });
app.get('/multa/view/:id', (req, res) => { multaController.view(req,res) });
app.get('/multa/create/', (req, res) => { multaController.create(req,res) });
app.post('/multa/create/', (req, res) => { multaController.create(req,res) });
app.get('/multa/update/:id', (req, res) => { multaController.update(req,res) });
app.post('/multa/update/', (req, res) => { multaController.update(req,res) });


// rutas sobre gestión de las rutas de transporte (autenticar)
app.get('/ruta/', (req, res) => { res.redirect('/ruta/index') });
app.get('/ruta/index', (req, res) => { res.render('pages/ruta/index') });
app.get('/ruta/create', (req, res) => { res.render('pages/ruta/index') });
app.get('/ruta/view/:id', (req, res) => { res.render('pages/ruta/index') });
app.get('/ruta/update/:id', (req, res) => { res.render('pages/ruta/index') });

// rutas sobre gestión de puntos de control (autenticar)
app.get('/punto-control/', (req, res) => { res.redirect('punto-control/index') });
app.get('/punto-control/index', (req, res) => { res.render('pages/punto-control/index') });
app.get('/punto-control/create', (req, res) => { res.render('pages/punto-control/index') });
app.get('/punto-control/view/:id', (req, res) => { res.render('pages/punto-control/index') });
app.get('/punto-control/update/:id', (req, res) => { res.render('pages/punto-control/index') });

// rutas sobre gestión de asistencia, retrasos, multas, etc (autenticar)
app.get('/control-asistencia/', (req, res) => { res.redirect('/control-asistencia/index') }); // redirigir a la pagina de registro de asistencia si es un chofer
app.get('/control-asistencia/registrar', (req, res) => { res.render('pages/control-asistencia/index') }); // equivalente al marcado de tarjeta
app.get('/control-asistencia/index', (req, res) => { res.render('pages/control-asistencia/index') });
app.get('/control-asistencia/view/:id', (req, res) => { res.render('pages/control-asistencia/index') });
app.get('/control-asistencia/update/:id', (req, res) => { res.render('pages/control-asistencia/index') });


/* ======================================================= */
/* ===================== shapefiles ====================== */
/* ======================================================= */

console.log('Shapefiles disponibles: ');
console.log(procesadorShapefile.shpPathsArr());

// página para mostrar el mapa
app.get('/shapefile', (req, res) => res.render('pages/shapefile'));

// servicio REST/JSON que responde un array de GeoJSON
app.get('/get-geojson/:filename', (req, res) => {
  procesadorShapefile.shpToGeoJsonArr(req.params.filename, (geoJsonArr) => {
    res.send(geoJsonArr);
  });
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


const io = require('socket.io')(server);    // handler de socket.io (requiere instanciar con un servidor http)

const chatNsp = io.of('/chat');                 // namespace "chat"
let chatSockets = [];

// escuchar al namespace "chat"
chatNsp.on('connection', (chatSocket) => {

  chatSockets.push(chatSocket);

  chatSocket.on('join', (data) => {
    console.log(`Usuario: ${data.uname} conectado a la sala: ${data.room}`);
    chatSocket.join(data.room);
    chatNsp.in(data.room).emit('messageFromServer', `El usuario ${data.uname} se ha conectado!`);
  });

  // registrar el mensaje recibido en la consola y emitir a todos
  // los clientes conectados a la misma sala
  chatSocket.on('messageFromClient', (obj) => {
    console.log(`[MSG] Mensaje recibido en "${obj.room}" del usuario "${obj.uname}":\n  "${obj.msg}"`);
    chatNsp.in(obj.room).emit('messageFromServer', `${obj.uname} dice: ${obj.msg}`);
  });

  chatSocket.on('disconnect', (reason) => {
    console.log('Un usuario se ha desconectado. Razón: ' + reason);
    // emitir a todo el namespace
    chatNsp.emit('message', 'Usuario desconectado');
  });
});

/* ======================================================= */
/* ================= socket.io tracking: ================= */
/* ======================================================= */

const trackingNsp = io.of('/tracking');   // namespace "tracking"
let trackingSockets = []; // array que mantiene referencias a los sockets conectados
let locations = [];

function getLocationIndex(locationData) {
  let result = -1;
  for (i = 0; i < locations.length; i++) {
    if (locations[i].bus_id == locationData.bus_id) {
      result = i;
      break;
    }
  }
  return result;
}


trackingNsp.on('connection', (trackingSocket) => {

  // añadir al array de sockets actualmente conectados.
  trackingSockets.push(trackingSocket);

  /* Estructura del objeto "newLocationData":
    newLocationData = {
      bus_id: int,
      coords: {
        latitude: real,
        longitude: real
      }
    }
  */
  trackingSocket.on('locationUpdate', (newLocationData) => {
    /*  se debería registrar:
        - qué bus está haciendo este recorrido?
        - coordenadas (lat y long)
        - tiempo
     */
    let index = getLocationIndex(newLocationData);
    if (index >= 0) {
      // update existing
      locations[index] = newLocationData;
    } else {
      // push new data
      locations.push(newLocationData);
    }

    trackingSocket.broadcast.emit('locationUpdate', newLocationData); // emite la información a todo el namespace
  });

  trackingSocket.on('allLocationsRequest', () => {
    // emitir el array de todos los buses solamente al cliente que lo requiere
    // es decir, no usar un "emit" común ;)
    trackingSocket.emit('allLocationsResponse', locations); // emite al cliente que envió la solicitud de ubicaciones
  });

  trackingSocket.on('disconnect', (reason) => {
    console.log('TrackingSocket disconnected. Reason: ' + reason);
    trackingSockets.splice(trackingSockets.indexOf(trackingSocket),1);
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


/**
 * Registra el texto pasado como parámetro tanto en la consola como
 * en el archivo de texto referenciado por 'logfile_path'
 * @param {string} text el texto a ser registrado en el log
 */
function log(text) {
  const logfile_path = process.env.LOGFILE_PATH;
  // obtener el tiempo en formato: YYYY:MM:DD:HH:MM:SS
  const cur_time = (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':');
  const log_text = cur_time + ": " + text + '\n';
  console.log(text);
  if ((logfile_path !== null || logfile_path !== '') && fs.existsSync(logfile_path)) {
    fs.appendFile(logfile_path, log_text, (err) => {
      if (err) {
        console.error('Error al escribir al archivo log: ' + err.message)
      }
    });
  } else {
    console.log('Nota: "LOGFILE_PATH" no especificado o archivo no existente.');
  }
}