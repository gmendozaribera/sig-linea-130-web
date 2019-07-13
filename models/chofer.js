module.exports = function (sequelize, DataTypes) {
  const Chofer = sequelize.define('chofer', {
    // objeto "attributes"
    chofer_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    cod_chofer: {
      // TO DO: cambiar a string
      type: DataTypes.INTEGER,
      unique: true
    },
    ci: {
      // TO DO: cambiar a string
      type: DataTypes.INTEGER,
      unique: true
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
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    direccion_domicilio: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false,
    tableName: 'chofer'
  });

  Chofer.associate = function(models){
    Chofer.hasMany(models.Bus, {foreignKey: 'chofer_id'});
    Chofer.hasMany(models.Multa, {foreignKey: 'multa_id'});
  }

  return Chofer;
}