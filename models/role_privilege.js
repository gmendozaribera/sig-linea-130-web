module.exports = function(sequelize, DataTypes){
  const RolePrivilege = sequelize.define('role_privilege',{
    // objeto "attributes"
    role_privilege_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }/*,
    privilege_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }*/
  },{
    // objeto "options"
    freezeTableName: true,
    timestamps: false,
    tableName: 'role_privilege'
  });

  RolePrivilege.associate = function(models){
    RolePrivilege.belongsTo(models.Privilege, {foreignKey: 'privilege_id'});
    RolePrivilege.belongsTo(models.Role, {foreignKey: 'role_id'});
  }

  return RolePrivilege;
}