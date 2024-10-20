'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chapter extends Model {
   
    static associate(models) {
      // define association here
      chapter.hasMany(models.page, {
        foreignKey: "chapterId",
      });
      chapter.belongsTo(models.coursesCreated, {
        foreignKey: "courseId",
      });
    }
  }
  chapter.init({
    chapterName: DataTypes.STRING,
    chapterDesc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'chapter',
  });
  return chapter;
};