console.log("Iniciando sistema de gestión de la linea 130...");

// requires básicos
const path = require('path');               // para facilitar el manejo de rutas del sistema de archivos
const fs = require('fs');                   // para manejo de archivos
const express = require('express');         // servidor HTTP
const { Pool } = require('pg');             // conector a PostgreSQL
const bodyParser = require('body-parser');  // para manejar POST requests
const shapefile = require('shapefile');

// algunas variables de entorno. TODO: mover a .env
const http_port = 5000;
const pg_port = 7775;
const logfile_path = "./log.txt";

// instanciado de Express (establecimiento del HTTP request handler)
const app = express();

// levantar servidor, escuchando en el puerto anteriormente establecido
const server = app.listen(http_port, () => {
    console.log(`Servidor escuchando en el puerto ${http_port}`)
});

// establecimiento del motor de vistas "EJS"
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// configuración del directorio público
app.use(express.static(path.join(__dirname, 'public')));

// estableciendo body-parser (para poder trabajar con input forms y JSON)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===================================================
// ============= CONFIGURACIÓN DE RUTAS ==============
// ===================================================

// homepage con información sobre el servicio
app.get('/', (req, res) => res.render('pages/index')); // done
app.get('/index', (req, res) => res.render('pages/index')); // done

// rutas de login
app.get('/login', (req, res) => res.render('pages/login/login-form')); // ui done

// rutas de signup
app.get('/signup', (req, res) => res.render('pages/signup/signup-form'));
app.get('/signup/verify', (req, res) => res.render('pages/signup/verify'));

// rutas de faq
app.get('/faq', (req, res) => res.render('pages/faq/index'));

// rutas de forgot-password
app.get('/forgot-password', (req, res) => res.render('pages/forgot-password/request-form'));
app.get('/forgot-password/request-form', (req, res) => res.render('pages/forgot-password/request-form'));
app.get('/forgot-password/verify', (req, res) => res.render('pages/forgot-password/verify'));
app.get('/forgot-password/confirm', (req, res) => res.render('pages/forgot-password/confirm'));


// rutas sobre gestion de choferes


// rutas sobre gestión de micros


// rutas sobre gestión de las rutas de transporte


// rutas sobre gestión de puntos de control


// rutas sobre gestión de asistencia, retrasos, multas, etc





/* ======================================================= */
/* =================== shapefile demo ==================== */
/* ======================================================= */

// página para mostrar el mapa
app.get('/shapefile', (req, res) => res.render('pages/shapefile'));

// servicio REST/JSON que responde un GeoJSON
app.get('/get-geojson', (req, res) => {
    shapefile.open("./shapefiles/ruta - linea 130.shp")
        .then((source) => source.read()
            .then(function log(result) {
                if (result.done) return;
                console.log(JSON.stringify(result.value));
                res.send(result.value);
                return source.read().then(log);
            }))
        .catch((error) => console.error(error.stack));
});

/* ======================================================= */
/* ================= socket.io chat demo: ================ */
/* ======================================================= */

// página para mostrar el form de chat
app.get('/chat', (req, res) => {
    res.render('pages/chat');
});

// página para mostrar el form de chat
app.get('/tracking', (req, res) => {
    res.render('pages/tracking');
});

// handler de socket.io (requiere instanciarse con un servidor http)
const io = require('socket.io')(server);

// espacio de nombres "tech"
const techNsp = io.of('/tech');

// escuchar como servidor
techNsp.on('connection', (socket) => {
    socket.on('join', (data) => {
        console.log(`user joined: ${data.uname}@${data.room}`);
        socket.join(data.room);
        techNsp.in(data.room).emit('message', `El usuario ${data.uname} se ha unido a la sala ${data.room}!`);
    });

    // registrar el mensaje recibido en la consola y emitir a todos
    // los clientes conectados a la misma sala
    socket.on('message', (obj) => {
        console.log(`[MSG] Received in "${obj.room}" from "${obj.uname}": "${obj.msg}"`);
        techNsp.in(obj.room).emit('message', `${obj.uname} says: ${obj.msg}`);
    });

    /*  data: {
            room: 'tracking',
            pointLatLon: {lat: -17.x, lon: -63.x}
        }
    */
    socket.on('location',(data)=>{
        techNsp.in(data.room).emit('location',data.pointLatLon);
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
        // emit as server (to whole namespace)
        techNsp.emit('message', 'user disconnected');
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