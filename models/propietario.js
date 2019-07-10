module.exports = function(sequelize, DataTypes){
  const Propietario = sequelize.define('propietario',{
    // objeto "attributes"
    propietario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cod_propietario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ci: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombres: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    apellidos: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    direccion_domicilio: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false
  });

  return Propietario;
}