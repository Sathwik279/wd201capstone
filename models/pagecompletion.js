'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pageCompletion extends Model {
    
    static associate(models) {
      // define association here
      pageCompletion.belongsTo(models.page,{
        foreignKey:"pageId"
      })
      pageCompletion.belongsTo(models.user,{
        foreignKey:"userId"
      })
    }
  }
  pageCompletion.init({
    pageId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'pageCompletion',
  });
  return pageCompletion;
};