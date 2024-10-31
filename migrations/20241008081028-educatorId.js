"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("coursesCreateds", "educatorId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("coursesCreateds", {
      fields: ["educatorId"],
      type: "foreign key",
      name: "users_educatorId_fk",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: 'CASCADE', // enable cascading deletes
      onUpdate: 'CASCADE', // enable cascading updates 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("coursesCreateds", "users_educatorId_fk"); // Remove the constraint first
    await queryInterface.removeColumn("coursesCreateds", "educatorId"); // Then remove the column
  },
};
