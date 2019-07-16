const models = require('../models');
const Bus = models.Bus;

/**
 * Acción listar registros de buses
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function index(req, res) {
  Bus.findAll({ order: [['placa_pta', 'ASC']] })
    .then((results) => {
      res.render('pages/bus/index', { buses: results });
    }).catch((error) => {
      console.error('Error al obtener la lista de buss: \n', error.message);
    });
}


/**
 * Acción ver detalles de un bus identificado por su ID
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function view(req, res) {
  // obtener propietario, chofer y linea
  console.log(req.params);
  Bus.findByPk(req.params.id, {
    // opciones de selección: obtener el estado del bus, el chofer y el propietario
    include: [models.EstadoBus, models.Chofer, models.Propietario, models.Linea]
  }).then((bus) => {
    console.log(bus);
    res.render('pages/bus/view', { bus: bus });
  }).catch((error) => {
    console.error(
      'Error al obtener el modelo "bus" desde la base de datos: \n',
      error.message);
  });
}

/**
 * Accion crear. En caso de GET muestra el formulario de creación de buses,
 * en caso de POST guarda el campo recien creado en la base de datos.
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function create(req, res) {
  if (req.method === 'POST') {
    Bus.create({
      placa_pta: req.body['txt-placa-pta'],
      cod_chasis: req.body['txt-cod-chasis'],
      marca: req.body['txt-marca'],
      modelo: req.body['txt-modelo'],
      anio: req.body['txt-anio'],
      fecha_registro: req.body['txt-telefono-chofer'],
      propietario_id: req.body['sel-propietario'],
      chofer_id: req.body['sel-chofer'],
      estado_bus_id: req.body['sel-estado']
    }).then((newBus) => {
      res.redirect(`/bus/view/${newBus.bus_id}`);
    }).catch((error) => {
      console.error('Crear el nuevo bus: \n', error.message);
      res.redirect('/');
    });
  } else {
    models.Chofer.findAll().then((choferes) => {
      models.Propietario.findAll().then((propietarios) => {
        models.EstadoBus.findAll().then((estados) => {
          res.render('pages/bus/create', {
            choferes,
            propietarios,
            estados
          }); 
        }); // catch estado...
      }); // catch propietario...
    }); // catch chofer...
  }
}


/**
 * Modificación o actualización de datos de buses
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function update(req, res) {
  if (req.method === 'POST') {
    Bus.findByPk(req.body['bus_id'])
      .then((bus) => {
        bus.update({
          placa_pta: req.body['txt-placa-pta'],
          cod_chasis: req.body['txt-cod-chasis'],
          marca: req.body['txt-marca'],
          modelo: req.body['txt-modelo'],
          anio: req.body['txt-anio'],
          fecha_registro: req.body['txt-telefono-chofer'],
          propietario_id: req.body['sel-propietario'],
          chofer_id: req.body['sel-chofer'],
          estado_bus_id: req.body['sel-estado']
          // fecha_registro: req.body['txt-fecha-registro-chofer']
        }).then((updatedBus) => {
          res.redirect(`/bus/view/${updatedBus.bus_id}`);
        }).catch((error) => {
          console.error('Error al actualizar el modelo "bus" a la base de datos: \n', error.message);
          res.redirect('/');
        });
      }).catch((error) => {
        console.error('Error al obtener el modelo "bus" desde la base de datos: \n', error.message);
        res.redirect('/');
      });
  } else {
    const opts = {
      include: [models.EstadoBus, models.Chofer, models.Propietario]
    };
    Bus.findByPk(req.params.id, opts).then((bus) => {
      models.Chofer.findAll().then((choferes) => {
        models.Propietario.findAll().then((propietarios) => {
          models.EstadoBus.findAll().then((estados) => {
            res.render('pages/bus/update', {
              bus,
              choferes,
              propietarios,
              estados
            }); 
          }); // catch estado...
        }); // catch propietario...
      }); // catch chofer...
    }).catch((error) => {
      console.error('Error al obtener el modelo "bus" desde la base de datos: \n', error.message);
      res.redirect('/');
    });
  }
}

module.exports = {
  index: index,
  view: view,
  create: create,
  update: update
};