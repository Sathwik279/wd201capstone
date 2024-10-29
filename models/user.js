"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
     
    
    static associate(models) {
      // define association here
      User.hasMany(models.coursesCreated, {
        foreignKey: "educatorId",
        onDelete: "CASCADE",
      });
      User.hasMany(models.coursesEnrolled, {
        foreignKey: "studentId",
        onDelete: "CASCADE",
      });
      User.hasMany(models.pageCompletion,{
        foreignKey:"userId",
        onDelete:"CASCADE"

      });
    }

    //instance method
    updatePass(newPass) {
      return this.update({ password: newPass });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
