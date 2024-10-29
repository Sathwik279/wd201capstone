"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("coursesEnrolleds", "studentId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("coursesEnrolleds", {
      fields: ["studentId"],
      type: "foreign key",
      name: "users_studentId_fk",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: 'CASCADE', // Enable cascading deletes
      onUpdate: 'CASCADE', // Enable cascading updates (optional)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("coursesEnrolleds", "users_studentId_fk"); // Remove the constraint first
    await queryInterface.removeColumn("coursesEnrolleds", "studentId"); // Then remove the column
  },
};
