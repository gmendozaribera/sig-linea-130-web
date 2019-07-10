module.exports = function(sequelize, DataTypes){
  const User = sequelize.define('user',{
    // objeto "attributes"
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },{
    // objeto "options"
    freezeTablenames: true,
    timestamps: false
  });

  return User;
}