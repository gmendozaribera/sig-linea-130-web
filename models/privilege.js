module.exports = function(sequelize, DataTypes){
  const Privilege = sequelize.define('privilege',{
    // objeto "attributes"
    privilege_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    priv_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    priv_description: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false,
    tableName: 'privilege'
  });

  Privilege.associate = function(models){
    Privilege.belongsToMany(models.Role, {through: models.RolePrivilege, foreignKey: 'privilege_id'});
  }

  return Privilege;
}