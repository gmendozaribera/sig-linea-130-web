module.exports = function(sequelize, DataTypes){
  const User = sequelize.define('user',{
    // objeto "attributes"
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    forgot_pw_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    acc_verify_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  },{
    // objeto "options"
    freezeTablenames: true,
    timestamps: true,
    tableName: 'user'
  });

  User.associate = function(models){
    User.belongsTo(models.Role, {foreignKey: 'role_id'});
    User.hasOne(models.Chofer, {foreignKey: 'user_id'});
    User.hasOne(models.Propietario, {foreignKey: 'user_id'});
  }

  return User;
}