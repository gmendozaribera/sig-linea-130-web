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
app.use(express.static(path.join(__dirname, 'public'))); // configuración del directorio público
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

/*  TO DO: autenticar usuarios en esta sección */
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

/*
    TO DO: obtener los credenciales del usuario, usarlos para hacer un select
    en la base de datos y obtener los datos completos del usuario
*/
passport.deserializeUser(function (user, done) {
  done(null, JSON.parse(user));
});

//  establecer un pequeño middleware que escribe las solicitudes a la consola
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
app.get('/propietario/index', (req, res) => {
  models.Propietario.findAll({ order: [['propietario_id', 'ASC']] })
    .then((results) => {
      res.render('pages/propietario/index', { propietarios: results });
    }).catch((error) => {
      log(error.message);
    });
});
app.get('/propietario/', (req, res) => { res.redirect('/propietario/index/') });
app.get('/propietario/create', (req, res) => { res.render('pages/propietario/create') });
app.get('/propietario/view/:id', (req, res) => { res.render('pages/propietario/view') });
app.get('/propietario/update/:id', (req, res) => { res.render('pages/propietario/update') });

// rutas sobre gestion de choferes (autenticar)
app.get('/chofer/index', (req, res) => {
  models.Chofer.findAll({ order: [['chofer_id', 'ASC']] })
    .then((results) => {
      res.render('pages/chofer/index', { choferes: results });
    }).catch((error) => {
      log(error.message);
    });
});
app.get('/chofer/', (req, res) => { res.redirect('/chofer/index') });
app.get('/chofer/create', (req, res) => { res.render('pages/chofer/create') });
app.post('/chofer/create/', (req, res) => {
  console.log(req.body);
  res.redirect('/chofer/');
});
app.get('/chofer/view/:id', (req, res) => {
  models
  res.render('pages/chofer/view', {

  })
});
app.get('/chofer/update/:id', (req, res) => { res.render('pages/chofer/update') });

// rutas sobre gestión de micros (autenticar)
app.get('/micro/index', (req, res) => {
  res.render('pages/micro/index', {
    micros: [
      {
        bus_id: 1,
        placa_pta: '1568-GAY',
        cod_chasis: 'invalid_vin',
        marca: 'Toyota',
        modelo: 'Coaster',
        anio: 2003
      }
    ]
  })
});
app.get('/micro/', (req, res) => { res.redirect('/micro/index/') });
app.get('/micro/create', (req, res) => { res.render('pages/micro/create') });
app.get('/micro/view/:id', (req, res) => { res.render('pages/micro/view') });
app.get('/micro/update/:id', (req, res) => { res.render('pages/micro/update') });

// rutas sobre multas o sanciones (autenticar)
app.get('/multa/', (req, res) => { res.redirect('/multa/index/') });
app.get('/multa/index', (req, res) => { res.render('pages/multa/index/') });
app.get('/multa/create', (req, res) => { res.render('pages/multa/create') });
app.get('/multa/view/:id', (req, res) => { res.render('pages/multa/view') });


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


// levantar servidor, escuchando en el puerto anteriormente establecido
const server = app.listen(http_port, () => {
  console.log(`Servidor escuchando en el puerto ${http_port}`)
});

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
  }else{
    console.log('Nota: "LOGFILE_PATH" no especificado o archivo no existente.');
  }
}