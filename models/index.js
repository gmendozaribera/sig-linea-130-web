
//  referenciar clase Sequelize y crear instancia con URI
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URI, {});

//  verificar la conectividad a la base de datos antes de proceder
// checkDbConnectivity(sequelize);

// establecer un objeto con referencias a los modelos existentes
const models = {
  User: sequelize.import('./user'),
  Chofer: sequelize.import('./chofer'),
  Propietario: sequelize.import('./propietario'),
  Bus: sequelize.import('./bus'),
  Multa: sequelize.import('./multa'),
  Turno: sequelize.import('./turno'),
  Viaje: sequelize.import('./viaje'),
  EstadoBus: sequelize.import('./estado_bus'),
  Linea: sequelize.import('./linea'),
  Privilege: sequelize.import('./privilege'),
  Role: sequelize.import('./role'),
  RolePrivilege: sequelize.import('./role_privilege')
};

// materializar las asociaciones para los modelos que las tengan definidas
// para cada modelo, del array, llamar a su función "associate()"
Object.keys(models).forEach((modelName) => {
  if('associate' in models[modelName]){
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;   //  instancia
models.Sequelize = Sequelize;   //  clase

module.exports = models;

/**
 * Método sucio para terminar/cerrar/cortar ejecución de la aplicación en caso de que
 * no se tenga conectividad con la base de datos al requerir este módulo.
 * 
 * TO DO: ejecutar de forma síncrona
 * 
 * @param {Sequelize} sequelize Instancia de Sequelize a verificar
 */  
/*async function checkDbConnectivity(sequelize) {
  console.log('Probando conexión a la base de datos...');
  try {
    await sequelize.authenticate();
    console.log('Sequelize se ha conectado a la base de datos de manera exitosa.');
  } catch (error) {
    console.log('¡No se puede conectar a la base de datos! Cerrando la aplicación.');
    process.kill(process.pid, 'SIGTERM'); // terminar aplicación
  }
}
*/