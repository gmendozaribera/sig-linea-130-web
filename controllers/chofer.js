const models = require('../models');
const Chofer = models.Chofer;

/**
 * Acción listar registros de choferes
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function index(req, res) {
  Chofer.findAll({ order: [['cod_chofer', 'ASC']] })
    .then((results) => {
      res.render('pages/chofer/index', { choferes: results });
    }).catch((error) => {
      console.error('Error al obtener la lista de choferes: \n', error.message);
    });
}


/**
 * Acción ver detalles de chofer identificado por su ID
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function view(req, res) {
  Chofer.findByPk(req.params.id)
    .then((chofer) => {
      res.render('pages/chofer/view', { chofer: chofer });
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "chofer" desde la base de datos: \n',
        error.message);
    });
}

/**
 * Accion crear, muestra el formulario de creación de choferes,
 * y guarda el campo recien creado en la base de datos.
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function create(req, res) {
  if (req.method === 'POST') {
    Chofer.create({
      cod_chofer: req.body['txt-cod-chofer'],
      ci: req.body['txt-ci-chofer'],
      nombres: req.body['txt-nombres-chofer'],
      apellidos: req.body['txt-apellidos-chofer'],
      fecha_nacimiento: req.body['txt-fecha-nacimiento-chofer'],
      telefono: req.body['txt-telefono-chofer'],
      email: req.body['txt-email-chofer'],
      direccion_domicilio: req.body['txt-direccion-domicilio-chofer'],
      fecha_registro: req.body['txt-fecha-registro-chofer']
    }).then((chofer) => {
      res.redirect(`/chofer/view/${chofer.chofer_id}`);
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "chofer" desde la base de datos: \n',
        error.message);
    });
  } else {
    res.render('pages/chofer/create');
  }
}


/**
 * Modificación o actualización de datos de choferes
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function update(req, res) {
  if (req.method === 'POST') {
    Chofer.findByPk(req.body['chofer_id'])
    .then((chofer) => {
      chofer.update({
        cod_chofer: req.body['txt-cod-chofer'],
        ci: req.body['txt-ci-chofer'],
        nombres: req.body['txt-nombres-chofer'],
        apellidos: req.body['txt-apellidos-chofer'],
        fecha_nacimiento: req.body['txt-fecha-nacimiento-chofer'],
        telefono: req.body['txt-telefono-chofer'],
        email: req.body['txt-email-chofer'],
        direccion_domicilio: req.body['txt-direccion-domicilio-chofer'],
        // fecha_registro: req.body['txt-fecha-registro-chofer']
      }).then((chofer) => {
        res.redirect(`/chofer/view/${chofer.chofer_id}`);
      }).catch((error) => {
        console.error(
          'Error al actualizar el modelo "chofer" a la base de datos: \n',
          error.message);
      });
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "chofer" desde la base de datos: \n',
        error.message);
    });
  } else {
    Chofer.findByPk(req.params.id)
    .then((chofer) => {
      res.render('pages/chofer/update', { chofer: chofer });
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "chofer" desde la base de datos: \n',
        error.message);
    });
  }
}

module.exports = {
  index: index,
  view: view,
  create: create,
  update: update
};