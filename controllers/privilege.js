const models = require('../models');
const Privilege = models.Privilege;

/**
 * Acción listar privilegios
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function index(req, res) {
  const opts = {
    // where: {attr1: value1, attr2, value2, ...},
    order: [['priv_name', 'ASC']],
    // include: [some, Related, Models]
  };
  Privilege.findAll(opts).then((results) => {
      res.render('pages/privilege/index', { privileges: results });
    }).catch((error) => {
      console.error('Error al obtener la lista de privilegios: \n', error.message);
      res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
    });
}


/**
 * Acción ver detalles de un privilegio identificado por su ID
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function view(req, res) {
  const opts = {
    // include: [some, related, models]
  };
  Privilege.findByPk(req.params.id, opts).then((privilege) => {
    res.render('pages/privilege/view', { privilege });
  }).catch((error) => {
    console.error('Error al obtener el modelo "privilege" desde la base de datos: \n', error.message);
    res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
  });
}

/**
 * Accion crear. En caso de GET muestra el formulario de creación de privilegio,
 * en caso de POST guarda el privilegio recien creado en la base de datos.
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function create(req, res) {
  if (req.method === 'POST') {
    Privilege.create({
      priv_name: req.body['priv_name'],
      priv_description: req.body['priv_description']
    }).then((newPrivilege) => {
      res.redirect(`/privilege/view/${newPrivilege.privilege_id}`);
    }).catch((error) => {
      console.error('Error guardar el modelo "privilege" en la base de datos: \n', error.message);
      res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
    });
  } else {
    res.render('/pages/privilege/create/');
  }
}


/**
 * Modificación/actualización de un registro de privilegio
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function update(req, res) {
  if (req.method === 'POST') {
    Privilege.findByPk(req.body['privilege_id']).then((privilege) => {
        privilege.update({
          priv_name: req.body['priv_name'],
          priv_description: req.body['priv_description']
        }).then((updatedPrivilege) => {
          res.redirect(`/privilege/view/${updatedPrivilege.privilege_id}`);
        }).catch((error) => {
          console.error('Error al actualizar el modelo "privilege" a la base de datos: \n', error.message);
          res.redirect('/');
        });
      }).catch((error) => {
        console.error('Error al obtener el modelo "privilege" desde la base de datos: \n', error.message);
        res.redirect('/');
      });
  } else {
    const opts = {
      // include: [some, related, models]
    };
    Privilege.findByPk(req.params.id, opts).then((privilege) => {
      res.render('pages/privilege/update/', { privilege });
    }).catch((error) => {
      console.error('Error al obtener el modelo "privilege" desde la base de datos: \n', error.message);
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