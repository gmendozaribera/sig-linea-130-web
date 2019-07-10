module.exports = function(sequelize, DataTypes){
  const Multa = sequelize.define('multa',{
    // objeto "attributes"
    multa_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    monto: {
      type: DataTypes.REAL,
      allowNull: true
    },
    concepto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fecha_multa: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false
  });

  return Multa;
}