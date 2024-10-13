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
      // onDelete: 'cascade',daveMern

      // onUpdate: 'cascade'
    });
   
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("coursesEnrolleds", "studentId");
  },
};
