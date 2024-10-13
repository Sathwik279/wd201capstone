"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class coursesEnrolled extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      coursesEnrolled.belongsTo(models.User, {
        foreignKey: "studentId",
      });
      coursesEnrolled.belongsTo(models.coursesCreated, {
        foreignKey: "courseId",
      });
    }
    
     
  }
  coursesEnrolled.init(
    {
      courseName: DataTypes.STRING,
      progress: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "coursesEnrolled",
    }
  );
  return coursesEnrolled;
};
