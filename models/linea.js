module.exports = function (sequelize, DataTypes) {
  const Linea = sequelize.define('linea', {
    // objeto "attributes"
    linea_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nro_interno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false
    },
    bus_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    propietario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
      // objeto "options"
      freezeTableName: true,
      timestamps: false
    });

  // establecimiento de FKs
  Linea.associate = function (models) {
    Linea.belongsTo(models.Propietario, {foreignKey: 'propietario_id'});
    Linea.belongsTo(models.Bus, {foreignKey: 'bus_id'});
    Linea.belongsToMany(models.Turno, {through: 'asignacion_turnos', foreignKey: 'linea_id'});
  }

  return Linea;
}