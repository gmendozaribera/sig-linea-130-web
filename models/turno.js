module.exports = function(sequelize, DataTypes){
  const Turno = sequelize.define('turno',{
    // objeto "attributes"
    turno_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    dia_de_semana: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    // objeto "options"
    freezeTablename: true,
    timestamps: false
  });

  Turno.associate = function(models){
    Turno.belongsToMany(models.Linea, {through: 'asignacion_turnos', foreignKey: 'turno_id'});
  }

  return Turno;
}