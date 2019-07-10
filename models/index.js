const Sequelize = require('sequelize');

//  instanciando sequelize con URI
const sequelize = new Sequelize(process.env.DB_URI, {});

// TO DO: verificar la conectividad con la DB antes de proceder!

const models = {
  User: sequelize.import('./user'),
  Chofer: sequelize.import('./chofer'),
  Propietario: sequelize.import('./propietario'),
  Bus: sequelize.import('./bus'),
  Multa: sequelize.import('./multa'),
  Turno: sequelize.import('./turno'),
  Viaje: sequelize.import('./viaje')
};

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;