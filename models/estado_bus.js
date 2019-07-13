module.exports = function(sequelize, DataTypes){
  const EstadoBus = sequelize.define('estado_bus',{
    // objeto "attributes"
    estado_bus_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false,
    tableName: 'estado_bus'
  });

  EstadoBus.associate = function(models){
    EstadoBus.hasMany(models.Bus, {foreignKey: 'estado_bus_id'});
  }
  

  return EstadoBus;
}