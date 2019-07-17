const models = require('../models');
const Role = models.Role;

/**
 * Acción listar privilegios
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function index(req, res) {
  const opts = {
    order: [['role_name', 'ASC']],
    //include: [some, Related, Models]
  };
  Role.findAll(opts)
    .then((results) => {
      res.render('pages/role/index', {
        user: req.user,
        flash: req.flash(),
        roles: results
      });
    }).catch((error) => {
      console.error('Error al obtener la lista de roles: \n', error.message);
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
  Role.findByPk(req.params.id, opts).then((role) => {
    res.render('pages/role/view', {
      user: req.user,
      flash: req.flash(),
      role
    });
  }).catch((error) => {
    console.error('Error al obtener el modelo "role" desde la base de datos: \n', error.message);
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
    Role.create({
      role_name: req.body['role_name'],
      role_description: req.body['role_description']
    }).then((newRole) => {
      res.redirect(`/role/view/${newRole.role_id}`);
    }).catch((error) => {
      console.error('Error guardar el modelo "role" en la base de datos: \n', error.message);
      res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
    });
  } else {
    res.render('pages/role/create', {
      user: req.user,
      flash: req.flash(),
    });
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
    Role.findByPk(req.body['role_id'])
      .then((role) => {
        role.update({
          role_name: req.body['role_name'],
          role_description: req.body['role_description']
        }).then((updatedRole) => {
          res.redirect(`/role/view/${updatedRole.role_id}`);
        }).catch((error) => {
          console.error('Error al actualizar el modelo "role" a la base de datos: \n', error.message);
          res.redirect('/');
        });
      }).catch((error) => {
        console.error('Error al obtener el modelo "role" desde la base de datos: \n', error.message);
        res.redirect('/');
      });
  } else {
    const opts = {
      // include: [some, related, models]
    };
    Role.findByPk(req.params.id, opts).then((role) => {
      res.render('pages/role/update/', {
        user: req.user,
        flash: req.flash(),
        role
      });
    }).catch((error) => {
      console.error('Error al obtener el modelo "role" desde la base de datos: \n', error.message);
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