module.exports = function(sequelize, DataTypes){
  const Viaje = sequelize.define('viaje',{
    // objeto "attributes"
    viaje_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tiempo_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tiempo_fin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    monto_recaudado: {
      type: DataTypes.REAL,
      allowNull: true
    },
    retrasado: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    observaciones: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },{
    // objeto "options"
    freezeTablename: true,
    timestamps: false
  });

  return Viaje;
}