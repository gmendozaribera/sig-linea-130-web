const models = require('../models');
const Multa = models.Multa;

/**
 * Acción listar multas
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function index(req, res) {
  opts = {
    order: [['fecha_multa', 'DESC']],
    include: [models.Chofer]
  };
  Multa.findAll(opts)
    .then((results) => {
      res.render('pages/multa/index', {
        user: req.user,
        flash: req.flash(),
        multas: results
      });
    }).catch((error) => {
      console.error('Error al obtener la lista de multas: \n', error.message);
      res.redirect('/');
    });
}


/**
 * Acción ver detalles de una multa identificada por su ID
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function view(req, res) {
  Multa.findByPk(req.params.id, {
    // opciones de selección: obtener el chofer multado
    include: [models.Chofer]
  }).then((multa) => {
    res.render('pages/multa/view', {
      user: req.user,
      flash: req.flash(),
      multa
    });
  }).catch((error) => {
    console.error(
      'Error al obtener el modelo "multa" desde la base de datos: \n',
      error.message);
    res.redirect('/');
  });
}

/**
 * Accion crear. En caso de GET muestra el formulario de creación de buses,
 * en caso de POST guarda el campo recien creado en la base de datos.
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function create(req, res) {
  if (req.method === 'POST') {
    Multa.create({
      fecha_multa: req.body['fecha_multa'],
      concepto: req.body['concepto'],
      monto: req.body['monto'],
      chofer_id: req.body['chofer_id']
    }).then((multa) => {
      res.redirect(`/multa/view/${multa.multa_id}`);
    }).catch((error) => {
      console.error(
        'Error al obtener el modelo "multa" desde la base de datos: \n',
        error.message);
      res.redirect('/');
    });
  } else {
    models.Chofer.findAll({ order: [['nombres', 'ASC']] })
      .then((choferes) => {
        res.render('pages/multa/create', {
          user: req.user,
          flash: req.flash(),
          choferes
        });
      });
  }
}


/**
 * Modificación o actualización de datos de buses
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function update(req, res) {
  if (req.method === 'POST') {
    Multa.findByPk(req.body['multa_id'])
      .then((multa) => {
        multa.update({
          fecha_multa: req.body['fecha_multa'],
          concepto: req.body['concepto'],
          monto: req.body['monto'],
          chofer_id: req.body['chofer_id']
        }).then((multa) => {
          res.redirect(`/multa/view/${multa.multa_id}`);
        }).catch((error) => {
          console.error(
            'Error al actualizar el modelo "multa" a la base de datos: \n',
            error.message);
        });
      }).catch((error) => {
        console.error(
          'Error al obtener el modelo "multa" desde la base de datos: \n',
          error.message);
      });
  } else {
    Multa.findByPk(req.params.id, {include: [models.Chofer]})
      .then((multa) => {
        models.Chofer.findAll()
          .then((choferes) => {
            res.render('pages/multa/update', {
              user: req.user,
              flash: req.flash(),
              multa, choferes
            });
          });
      }).catch((error) => {
        console.error(
          'Error al obtener el modelo "multa" desde la base de datos: \n',
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