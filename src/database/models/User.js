export default (sequelize, dataTypes) => {
  let alias = "User";

  let cols = {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    first_name: { type: dataTypes.STRING(200) },
    last_name: { type: dataTypes.STRING(200) },
    email: { type: dataTypes.STRING(255) },
    password: { type: dataTypes.STRING(255) },
  };

  let config = {
    tableName: "users",
    paranoid: false,
    timestamps: false,
    underscored: false,
  };

  const User = sequelize.define(alias, cols, config);

  User.associate = (models) => {
    
  };

  return User;
};
