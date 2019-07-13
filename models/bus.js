module.exports = function (sequelize, DataTypes) {
  const Bus = sequelize.define('bus', {
    // objeto "attributes"
    bus_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    placa_pta: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    cod_chasis: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    modelo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
      // objeto "options"
      freezeTableName: true,
      timestamps: false,
      tableName: 'bus'
    });



  // establecimiento de FKs
  Bus.associate = function (models) {
    Bus.belongsTo(models.Propietario, { foreignKey: 'propietario_id' });
    Bus.belongsTo(models.Chofer, { foreignKey: 'chofer_id' });
    Bus.belongsTo(models.EstadoBus, { foreignKey: 'estado_bus_id' });
    Bus.hasOne(models.Linea, { foreignKey: 'bus_id' });
  }

  return Bus;
}