"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class page extends Model {
    static associate(models) {
      // define association here
      page.belongsTo(models.chapter, {
        foreignKey: "chapterId",
      });
      page.hasMany(models.pageCompletion,{
        foreignKey:"pageId",
        onDelete:"CASCADE"
      });
      page.belongsTo(models.coursesCreated,{
        foreignKey:"courseId"
      }
      )
      
    }
  }
  page.init(
    {
      pageName: DataTypes.STRING,
      pageContent: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "page",
    }
  );
  return page;
};
