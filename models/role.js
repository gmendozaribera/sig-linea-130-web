module.exports = function(sequelize, DataTypes){
  const Role = sequelize.define('role',{
    // objeto "attributes"
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    role_description: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false,
    tableName: 'role'
  });

  Role.associate = function(models){
    Role.belongsToMany(models.Privilege, {through: models.RolePrivilege, foreignKey: 'role_id'});
  }

  return Role;
}