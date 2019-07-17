console.log("[INFO] Iniciando sistema de gestión de la linea 130...");

// ===========================================================================
// ============================ REQUIRES BASICOS =============================
// ===========================================================================

const path = require('path');                 // para facilitar el manejo de rutas del sistema de archivos
const fs = require('fs');                     // para manejo de archivos
const express = require('express');           // servidor HTTP
const bodyParser = require('body-parser');    // para manejar POST requests (trabajar con datos de input forms como JSON)
const session = require('express-session');   // manejo de sesiones en express
const passport = require('passport');         // lib para estrategias de inicio de sesión
const LocalStrategy = require('passport-local').Strategy;   // estrategia de inicio de sesión local de passport
const procesadorShapefile = require('./procesador-shapefile');    // mi procesador de shapefiles :v
const models = require('./models');           //  los modelos Sequelize ORM
const flash = require('connect-flash');     // para mostrar mensajes flash
const crypto = require('crypto');

// algunas variables de entorno.
const http_port = process.env.PORT || 5000;
const app_secret = process.env.APP_SECRET || 'SHOULDREALLYCHANGETHISINPROD';





// ===========================================================================
// ======================== CONFIGURACIÓN DE EXPRESS =========================
// ===========================================================================

const app = express(); // instanciado de Express (establecimiento del HTTP request handler)
app.set('views', path.join(__dirname, 'views')); // establecimiento del motor de vistas "EJS"
app.set('view engine', 'ejs'); // establecimiento del motor de vistas "EJS"
app.use(session({ secret: app_secret, resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public'))); // configuración del directorio público (assets)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// pequeño middleware que escribe las solicitudes a la consola
app.use((req, res, next) => {
  console.log(`[REQUEST] IP: "${req.ip}"; URL: "${req.url}"`);
  next();
});


// levantar servidor, escuchando en el puerto anteriormente establecido
const server = app.listen(http_port, () => {
  console.log(`[INFO] Servidor escuchando en el puerto ${http_port}`)
});


// listar los shapefiles disponibles
console.log('[INFO] Shapefiles disponibles en la carpeta "./shapefiles":');
console.log(procesadorShapefile.shpPathsArr());


// ===========================================================================
// ======================== CONFIGURACIÓN DE PASSPORT ========================
// ===========================================================================

//  TO DO: autenticar usuarios en esta sección, por ahora solamente es una prueba de concepto.
passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log(`[AUTH] Intentando autenticar al usuario "${username}" con estrategia "passport local"`);
    const opts = {
      where: {
        username: username,
        password: crypto.createHash('md5').update(password).digest('hex')
      }
    };
    models.User.findOne(opts).then((user) => {
      console.log('[AUTH] Intancia de modelo "User":', user);
      if (user) {
        console.log(`[AUTH] Usuario obtenido: ${user.username}`);
        console.log('[AUTH] El usuario es válido. Completando login...');
        return done(null, { user_id: user.user_id, username: user.username });
      } else {
        console.log('[AUTH] Error al obtener el modelo de usuario. Contraseña incorrecta?');
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }
    });
  }
));

//  TO DO: guardar detalles del usuario
passport.serializeUser(function (user, done) {
  done(null, user.user_id);
});

//  TO DO: obtener los credenciales del usuario, usarlos para hacer un select
//  en la base de datos y obtener los datos completos del usuario
passport.deserializeUser(function (user_id, done) {
  console.log('[AUTH] Deserializando usuario...');
  models.User.findByPk(user_id).then((user) => {
    if (user) {
      console.log('[AUTH] Deserializado exitoso!');
      done(null, user);
    } else {
      console.log('[AUTH] Deserializado fallido!');
      done(null, false);
    }
  }).catch((err) => {
    console.log(`[AUTH] Error al deserializar el usuario con ID: ${user_id}`, err);
    done(err);
  });
});

/**
 * Pequeño middleware que verifica si el usuario actual está autenticado y redirige de acuerdo al resultado.
 * Se lo debe llamar en todas las rutas que requieran autenticación.
 * 
 * @param {Express.Request} req La petición a manejar
 * @param {Express.Response} res La respuesta a emitir
 * @param {function} next El siguiente middleware a tratar
 */
const requireAuthentication = function (req, res, next) {
  if (req.isAuthenticated()) {
    // si ya está autenticado y trata de entrar a login o signup, redirigir a '/'
    if (req.path.toLowerCase().match(/(login|signup)/)) res.redirect('/');
    next(); // ejecutar el siguiente middleware de la cadena
  } else {
    req.flash('error', 'Para utilizar esta funcionalidad, usted debe iniciar sesión.');
    return res.redirect('/login');
  }
};

/**
 * Middleware que verifica si el usuario actual tiene permiso para acceder a la funcionalidad solicitada
 * @param {Express.Request} req Petición a manejar
 * @param {Express.Response} res Respuesta a emitir
 * @param {function} next El siguiente middleware
 */
const requireAuthorization = function (req, res, next) {
  if (req.user) {
    models.User.findOne(req.user.user_id, {
      include: [models.Role]
    }).then((user) => {
      user.role.getPrivileges().then((privileges) => {
        console.log(privileges);
        res.redirect('/403');
        // TO DO: comparar los privilegios con la ruta que está solicitando
      }); // catch privileges error
    }); // catch user error
  } else {
    res.redirect('/login');
  }
};

const requireGuest = function (req, res, next) {
  if (req.user) {
    req.flash('error', 'No puede usar esta función al estar autenticado.');
    return res.redirect('/');
  }
  next();
};





// ===========================================================================
// ======================= CONFIGURACIÓN DE RUTAS ============================
// ===========================================================================

// homepage con información sobre el servicio
app.get('/', (req, res) => res.redirect('/index'));
app.get('/index', (req, res) => {
  if (!req.user) {
    req.flash('info', 'Para gozar de la funcionalidad completa de esta aplicación, debe iniciar sesión.');
  }
  res.render('pages/index', {
    user: req.user,
    flash: req.flash()
  });
});

// rutas de login
app.get('/login', requireGuest, (req, res) => {
  res.render('pages/login/login-form', {
    user: req.user,
    flash: req.flash()
  })
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: 'Error al iniciar sesión. Contraseña incorrecta?',
  successFlash: 'Inicio de sesión exisoto.'
}));

app.post('/logout', (req, res) => {
  console.log('[AUTH] Cerrando sesión...');
  if (req.user) {
    req.logout();
    req.flash('success', 'Sesión cerrada con éxito!');
  } else {
    console.log('[AUTH] No había ninguna sesión activa!');
    req.flash('error', 'No hay sesión que cerrar :v');
  }
  res.redirect('/index');
});


// rutas de signup (creación de cuentas de usuario)
app.get('/signup', requireGuest, (req, res) => {
  res.render('pages/signup/signup-form', {
    user: req.user,
    flash: req.flash()
  })
});

app.post('/signup', (req, res) => {
  console.log(JSON.stringify(req.body));
  console.log(req.body.username);
  console.log(req.body.password);
  console.log(req.body.email);
  res.redirect('/signup/verify');
});

app.get('/signup/verify', requireGuest, (req, res) => res.render('pages/signup/verify', {
  user: req.user,
  flash: req.flash()
}));

// rutas de faq
app.get('/faq', (req, res) => {
  faq = fs.readFileSync('./faq.json').toString();
  res.render('pages/faq', {
    user: req.user,
    flash: req.flash(),
    faq: JSON.parse(faq)
  });
});

// rutas de forgot-password
app.get('/forgot-password', requireGuest, (req, res) => res.render('pages/forgot-password/request-form', {
  user: req.user,
  flash: req.flash()
}));
app.get('/forgot-password/request-form', requireGuest, (req, res) => res.render('pages/forgot-password/request-form', {
  user: req.user,
  flash: req.flash()
}));
app.get('/forgot-password/verify', requireGuest, (req, res) => res.render('pages/forgot-password/verify', {
  user: req.user,
  flash: req.flash()
}));
app.get('/forgot-password/confirm', requireGuest, (req, res) => res.render('pages/forgot-password/confirm', {
  user: req.user,
  flash: req.flash()
}));

//  rutas sobre gestión de propietarios de buses (autenticar)
const propietarioController = require('./controllers/propietario');
app.get('/propietario/', (req, res) => { res.redirect('/propietario/index/') });
app.get('/propietario/index', requireAuthentication, (req, res) => { propietarioController.index(req, res) });
app.get('/propietario/create', requireAuthentication, (req, res) => { propietarioController.create(req, res) });
app.post('/propietario/create', (req, res) => { propietarioController.create(req, res) });
app.get('/propietario/view/:id', requireAuthentication, (req, res) => { propietarioController.view(req, res) });
app.get('/propietario/update/:id', requireAuthentication, (req, res) => { propietarioController.update(req, res) });
app.post('/propietario/update/', (req, res) => { propietarioController.update(req, res) });

// rutas sobre gestion de choferes (autenticar)
const choferController = require('./controllers/chofer');
app.get('/chofer/', (req, res) => { res.redirect('/chofer/index') });
app.get('/chofer/index/', requireAuthentication, (req, res) => { choferController.index(req, res) });
app.get('/chofer/create/', requireAuthentication, (req, res) => { choferController.create(req, res) });
app.post('/chofer/create/', (req, res) => { choferController.create(req, res) });
app.get('/chofer/view/:id', requireAuthentication, (req, res) => { choferController.view(req, res) });
app.get('/chofer/update/:id', requireAuthentication, (req, res) => { choferController.update(req, res) });
app.post('/chofer/update/', (req, res) => { choferController.update(req, res) });

// rutas sobre gestión de buses/micros (autenticar)
const busController = require('./controllers/bus');
app.get('/bus/', (req, res) => { res.redirect('/bus/index/') });
app.get('/bus/index/', requireAuthentication, (req, res) => { busController.index(req, res) });
app.get('/bus/view/:id', requireAuthentication, (req, res) => { busController.view(req, res) });
app.get('/bus/create/', requireAuthentication, (req, res) => { busController.create(req, res) });
app.post('/bus/create/', requireAuthentication, (req, res) => { busController.create(req, res) });
app.get('/bus/update/:id', (req, res) => { busController.update(req, res) });
app.post('/bus/update/', requireAuthentication, (req, res) => { busController.update(req, res) });

// rutas sobre multas o sanciones (autenticar)
const multaController = require('./controllers/multa');
app.get('/multa/', (req, res) => { res.redirect('/multa/index/') });
app.get('/multa/index/', requireAuthentication, (req, res) => { multaController.index(req, res) });
app.get('/multa/view/:id', requireAuthentication, (req, res) => { multaController.view(req, res) });
app.get('/multa/create/', requireAuthentication, (req, res) => { multaController.create(req, res) });
app.post('/multa/create/', (req, res) => { multaController.create(req, res) });
app.get('/multa/update/:id', requireAuthentication, (req, res) => { multaController.update(req, res) });
app.post('/multa/update/', (req, res) => { multaController.update(req, res) });

// rutas sobre roles (autenticar)
const roleController = require('./controllers/role');
app.get('/role/', (req, res) => { res.redirect('/role/index/') });
app.get('/role/index/', requireAuthentication, (req, res) => { roleController.index(req, res) });
app.get('/role/view/:id', requireAuthentication, (req, res) => { roleController.view(req, res) });
app.get('/role/create/', requireAuthentication, (req, res) => { roleController.create(req, res) });
app.post('/role/create/', (req, res) => { roleController.create(req, res) });
app.get('/role/update/:id', requireAuthentication, (req, res) => { roleController.update(req, res) });
app.post('/role/update/', (req, res) => { roleController.update(req, res) });

// rutas sobre privilegios (autenticar)
const privController = require('./controllers/privilege');
app.get('/privilege/', (req, res) => { res.redirect('/privilege/index/') });
app.get('/privilege/index/', requireAuthentication, (req, res) => { privController.index(req, res) });
app.get('/privilege/view/:id', requireAuthentication, (req, res) => { privController.view(req, res) });
app.get('/privilege/create/', requireAuthentication, (req, res) => { privController.create(req, res) });
app.post('/privilege/create/', (req, res) => { privController.create(req, res) });
app.get('/privilege/update/:id', requireAuthentication, (req, res) => { privController.update(req, res) });
app.post('/privilege/update/', (req, res) => { privController.update(req, res) });

// rutas sobre usuarios (autenticar)
const userController = require('./controllers/user');
app.get('/user/', (req, res) => { res.redirect('/user/index/') });
app.get('/user/index/', requireAuthentication, (req, res) => { userController.index(req, res) });
app.get('/user/view/:id', requireAuthentication, (req, res) => { userController.view(req, res) });
app.get('/user/create/', requireAuthentication, (req, res) => { userController.create(req, res) });
app.post('/user/create/', (req, res) => { userController.create(req, res) });
app.get('/user/update/:id', requireAuthentication, (req, res) => { userController.update(req, res) });
app.post('/user/update/', (req, res) => { userController.update(req, res) });

// página que muestra las rutas, paradas y hace seguimiento a los buses en ruta
app.get('/ver-ruta-ida', (req, res) => res.render('pages/ver-ruta', {
  user: req.user,
  flash: req.flash(),
  sentido: 'ida'
}));
app.get('/ver-ruta-vuelta', (req, res) => res.render('pages/ver-ruta', {
  user: req.user,
  flash: req.flash(),
  sentido: 'vuelta'
}));

// map test!
app.get('/tracking-test', (req, res) => {
  res.render('pages/tracking-test', {
    user: req.user,
    flash: req.flash()
  });
});


// prueba de login para la app movil :v
// por ahora autentica con el CI y el códido del chofer
app.get('/api/v1/login', (req, res) => {
  const user = req.query.user;
  const pass = req.query.pass;

  models.Chofer.findOne({ where: { ci: user, cod_chofer: pass } }).then((chofer) => {
    if (chofer) {
      models.Bus.findOne({ where: { chofer_id: chofer.chofer_id } }).then((bus) => {
        if (bus) {
          models.Linea.findOne({ where: { bus_id: bus.bus_id } }).then((linea) => {
            if (linea) {
              res.send(JSON.stringify({
                success: true,
                chofer: chofer.cod_chofer,
                bus: bus.placa_pta,
                linea: linea.nro_interno
              }));
            } else {
              const errStr = 'Este chofer no tenía ninguna línea especificada.';
              console.log(errStr);
              res.send(JSON.stringify({ success: false, errorMsg: errStr }));
            }
          });
        } else {
          const errStr = 'Este chofer no tiene ningun bus especificado.';
          console.log(errStr);
          res.send(JSON.stringify({ success: false, errorMsg: errStr }));
        }
      });
    } else {
      const errStr = 'No existe un chofer con esos datos.';
      console.log(errStr);
      res.send(JSON.stringify({ success: false, errorMsg: errStr }));
    }
  });
});


// ===========================================================================
// ========================= SHAPEFILES ======================================
// ===========================================================================

// servicio REST/JSON que responde un array de GeoJSON
app.get('/get-geojson/:filename', (req, res) => {
  procesadorShapefile.shpToGeoJsonArr(req.params.filename, (geoJsonArr) => {
    res.send(geoJsonArr);
  });
});


// página para mostrar el form de chat
app.get('/chat', requireAuthentication, (req, res) => {
  res.render('pages/chat', {
    user: req.user,
    flash: req.flash()
  });
});


// manejando rutas no definidas -> tirar un 404
app.get('*', (req, res) => {
  res.status(404).render('pages/404', {
    user: req.user,
    flash: req.flash()
  });
  log(`404: Solicitud para ruta no válida: ${req.url}`);
});

// ===================================================
// ============ /CONFIGURACIÓN DE RUTAS ==============
// ===================================================



// ===========================================================================
// ======================= SOCKET.IO CHAT DEMO ===============================
// ===========================================================================

const io = require('socket.io')(server);    // handler de socket.io (requiere instanciar con un servidor http)

const chatNsp = io.of('/chat'); // namespace "chat"
let chatSockets = [];

// escuchar al namespace "chat"
chatNsp.on('connection', (chatSocket) => {

  chatSockets.push(chatSocket);

  chatSocket.on('join', (data) => {
    console.log(`[USR] Usuario: ${data.uname} conectado a la sala: ${data.room}`);
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

// ===========================================================================
// ======================== SOCKET.IO TRACKING ===============================
// ===========================================================================

const trackingNsp = io.of('/rastreo');   // namespace "rastreo-ida"
let trackingSockets = []; // array que mantiene referencias a los sockets conectados
let savedLocations = []; // array que mantinene una lista de ubicaciones

trackingNsp.on('connection', (trackingSocket) => {

  trackingSockets.push(trackingSocket); // añadir al array de sockets actualmente conectados.
  console.log(`[TRACKING] Nuevo socket de seguimiento registrado: Socket ID: ${trackingSocket.id}`);
  logTrackingSockets();

  trackingSocket.on('join', (data) => {
    trackingSocket.join(data.room);
  });


  trackingSocket.on('locationFromClient', (newLocation) => {
    /* Estructura del objeto "newLocationData":
    newLocation = {
      nro_interno: int,
      time: timestamp,
      room: string,
      coords: {
        latitude: real,
        longitude: real
      }
    } */

    newLocation.time = Date.now(); // agregar timestamp (para determinar edad del dato)
    trackingNsp.to(newLocation.room).emit('locationFromServer', newLocation); // emitir la nueva información a los clientes
    const index = getBusLocationIndex(newLocation.nro_interno); // determinar si ya se tenía registro de este bus
    // TO DO: manejar el caso en que el bus que está siendo modificado ya existía en otro room
    if (index >= 0) {
      const oldLocation = savedLocations[index];
      if (oldLocation.room !== newLocation.room) {
        trackingNsp.to(oldLocation.room).emit('removeBusLocation', oldLocation);
      }
      savedLocations[index] = newLocation; // reemplazar el dato existente
    } else {
      savedLocations.push(newLocation); // insertar el nuevo dato
    }
    logSavedLocations();
  });




  trackingSocket.on('allLocationsRequest', (data) => {
    // obtener todas las ubicaciones de buses que correspondan a este room
    let locationsForRoom = [];
    savedLocations.forEach((savedLocation) => {
      if (savedLocation.room === data.room) locationsForRoom.push(savedLocation);
    });
    trackingSocket.emit('allLocationsResponse', locationsForRoom); // emite solamente al socket que envió la solicitud de ubicaciones
  });



  trackingSocket.on('removeBusLocation', (data) => {
    console.log(`Trying to remove bus with ID: ${data.nro_interno}`);
    const index = getBusLocationIndex(data.nro_interno);
    if (index >= 0) {
      savedLocations.splice(index, 1);
    }
    console.log(`Broadcasting deletion of bus "${data.nro_interno}" on room: ${data.room}`);
    trackingNsp.to(data.room).emit('removeBusLocation', data);
  });




  trackingSocket.on('disconnect', (reason) => {
    console.log(`[TRACKING] Socket de rastreo desconectado. Socket ID: ${trackingSocket.id}; Razón: ${reason}`);
    trackingSockets.splice(trackingSockets.indexOf(trackingSocket), 1); // quitar del array de sockets tracking
    logTrackingSockets();
  });

}); /* /trackingNsp  */

function logTrackingSockets() {
  console.log('trackingSockets: [');
  trackingSockets.forEach((trackingSocket) => { console.log('  ' + trackingSocket.id + ',') });
  console.log(']');
}

function logSavedLocations() {
  console.log('savedLocations: [');
  savedLocations.forEach((savedLocation) => {
    console.log(`  Bus ID: ${savedLocation.nro_interno}; coords: [${JSON.stringify(savedLocation.coords)}]`)
  });
  console.log(']');
}

/**
 * Obtiene el índice de la ubicación de un bus, buscando por el número de interno
 * @param {integer} nro_interno El número de interno de un bus
 */
function getBusLocationIndex(nro_interno) {
  let result = -1;
  for (i = 0; i < savedLocations.length; i++) {
    if (savedLocations[i].nro_interno == nro_interno) {
      result = i;
      break;
    }
  }
  return result;
}

// ===========================================================================
// ======================== PROCESOS AUXILIARES ==============================
// ===========================================================================


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


// manejar la señal de terminación del programa
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => {
    console.log('Express HTTP server: Process terminated');
  });
});