"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class page extends Model {
    static associate(models) {
      // define association here
      page.belongsTo(models.chapter, {
        foreignKey: "chapterId",
      });
    }
  }
  page.init(
    {
      pageName: DataTypes.STRING,
      pageContent: DataTypes.TEXT,
      completed: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    {
      sequelize,
      modelName: "page",
    }
  );
  return page;
};
