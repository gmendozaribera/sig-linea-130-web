const models = require('../models');
const crypto = require('crypto');
const app_secret = process.env.APP_SECRET;
const UserModel = models.User; // TO DO: estandarizar esta nomenclatura en todos los models

/**
 * Acción listar privilegios
 * 
 * @param {Express.request} req 
 * @param {Express.response} res 
 */
function index(req, res) {
  opts = {
    where: { status: true },
    order: [['username', 'ASC']],
    include: [models.Role]
  };
  UserModel.findAll(opts)
    .then((results) => {
      res.render('pages/user/index', {
        user: req.user,
        flash: req.flash(),
        users: results });
    }).catch((error) => {
      console.error('Error al obtener la lista de usuarios: \n', error.message);
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
  opts = {
    include: [models.Role]
  };
  UserModel.findByPk(req.params.id, opts).then((user) => {
    res.render('pages/user/view', {
      user: req.user,
      flash: req.flash(),
      user
    });
  }).catch((error) => {
    console.error('Error al obtener el modelo "user" desde la base de datos: \n', error.message);
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
    UserModel.create({
      username: req.body['username'],
      password: crypto.createHash('md5').update(req.body['password']).digest('hex'),
      email: req.body['email'],
      role_id: req.body['role_id']
      // opcionales: forgot_pw, acc_verify, status
    }).then((newUser) => {
      res.redirect(`/user/view/${newUser.user_id}`);
    }).catch((error) => {
      console.error('Error al guardar el modelo "user" en la base de datos: \n', error.message);
      res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
    });
  } else {
    models.Role.findAll({order: [['role_name', 'ASC']]}).then((roles) => {
      res.render('pages/user/create', {
        user: req.user,
        flash: req.flash(),
        roles
      });
    }).catch((error) => {
      console.error('Error al obtener los roles disponibles: \n', error.message);
      res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
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
    UserModel.findByPk(req.body['user_id'])
      .then((user) => {
        user.update({
          username: req.body['username'],
          password: crypto.createHash('md5').update(req.body['password']).digest('hex'),
          email: req.body['email'],
          status: req.body['status'],
          role_id: req.body['role_id']
        }).then((updatedUser) => {
          res.redirect(`/user/view/${updatedUser.user_id}`);
        }).catch((error) => {
          console.error('Error al actualizar el modelo "user" a la base de datos: \n', error.message);
          res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
        });
      }).catch((error) => {
        console.error('Error al obtener el modelo "user" desde la base de datos: \n', error.message);
        res.redirect('/'); // TO DO: establecer un flash informando el error por la UI
      });
  } else {
    opts = {
      include: [models.Role]
    };
    // obtener el usuario especificado
    UserModel.findByPk(req.params.id, opts).then((user) => {
      // obtener todos los modelos disponibles
      models.Role.findAll({order: [['role_name','ASC']]}).then((roles) => {
        res.render('pages/user/update', {
          user: req.user,
          flash: req.flash(),
          user,
          roles
        });
      }).catch((error) => {
        console.error('Error al obtener los roles disponibles: \n', error.message);
        res.redirect('/');
      });
    }).catch((error) => {
      console.error('Error al obtener el modelo "user" desde la base de datos: \n', error.message);
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