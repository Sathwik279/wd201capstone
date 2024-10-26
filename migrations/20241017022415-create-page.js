'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pages', {
      id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
      },
      pageName: {
      type: Sequelize.STRING
      },
      pageContent: {
      type: Sequelize.TEXT 
      },
      completed:{
      type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      createdAt: {
      allowNull: false,
      type: Sequelize.DATE
      },
      updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pages');
  }
};