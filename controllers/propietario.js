const models = require('../models');
const propietario = models.Propietario;

/**
 * Acción listar registros de propietarios
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function index(req, res) {
  propietario.findAll({ order: [['cod_propietario', 'ASC']] })
    .then((results) => {
      res.render('pages/propietario/index', { propietarios: results });
    }).catch((error) => {
      console.error('Error al obtener la lista de propietarios: \n', error.message);
    });
}


/**
 * Acción ver detalles de propietario
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function view(req, res) {
  propietario.findByPk(req.params.id)
    .then((propietario) => {
      res.render('pages/propietario/view', {
        propietario: propietario
      });
    }).catch((error) => {
      console.error('Error al obtener el modelo de propietario: \n', error.message);
    });
}

/**
 * Accion crear, muestra el formulario de creación de propietarios,
 * y guarda el campo recien creado en la base de datos.
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function create(req, res) {
  if (req.method === 'POST') {
    propietario.create({
      cod_propietario: req.body['txt-cod-propietario'],
      ci: req.body['txt-ci-propietario'],
      nombres: req.body['txt-nombres-propietario'],
      apellidos: req.body['txt-apellidos-propietario'],
      fecha_nacimiento: req.body['txt-fecha-nacimiento-propietario'],
      telefono: req.body['txt-telefono-propietario'],
      email: req.body['txt-email-propietario'],
      direccion_domicilio: req.body['txt-direccion-domicilio-propietario'],
      fecha_registro: req.body['txt-fecha-registro-propietario']
    }).then((propietario) => {
      // console.log(propietario);
      res.redirect('/propietario/index/');
    }).catch((error) => {
      console.error('Error al crear el modelo de propietario: \n', error.message);
    });
  } else {
    res.render('pages/propietario/create');
  }
}


/**
 * Modificación o actualización de datos de propietarios
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
function update(req, res) {
  if (req.method === 'POST') {
    propietario.findByPk(req.body['propietario_id'])
    .then((propietario) => {
      propietario.update({
        cod_propietario: req.body['txt-cod-propietario'],
        ci: req.body['txt-ci-propietario'],
        nombres: req.body['txt-nombres-propietario'],
        apellidos: req.body['txt-apellidos-propietario'],
        fecha_nacimiento: req.body['txt-fecha-nacimiento-propietario'],
        telefono: req.body['txt-telefono-propietario'],
        email: req.body['txt-email-propietario'],
        direccion_domicilio: req.body['txt-direccion-domicilio-propietario'],
        // fecha_registro: req.body['txt-fecha-registro-propietario']
      }).then((propietario) => {
        res.redirect(`/propietario/view/${propietario.propietario_id}`);
      }).catch((error) => {
        console.error(
          'Error al actualizar el modelo "propietario" a la base de datos: \n',
          error.message);
      });
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "propietario" desde la base de datos: \n',
        error.message);
    });
  } else {
    propietario.findByPk(req.params.id)
    .then((propietario) => {
      res.render('pages/propietario/update', { propietario: propietario });
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "propietario" desde la base de datos: \n',
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