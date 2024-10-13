'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("coursesEnrolleds", "courseId", {
      type: Sequelize.INTEGER,
    });
    await queryInterface.addConstraint("coursesEnrolleds", {
      fields: ["courseId"],
      type: "foreign key",
      references: {
        table: "coursesCreateds",
        field: "id",
      },
      // onDelete: 'cascade',daveMern

      // onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("coursesEnrolleds", "courseId");

  }
};
