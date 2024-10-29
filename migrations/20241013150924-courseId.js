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
      onDelete: 'CASCADE', // Enable cascading deletes
      onUpdate: 'CASCADE', // Enable cascading updates (optional)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("coursesEnrolleds", "coursesEnrolleds_courseId_fkey"); // Replace with the actual constraint name if needed
    await queryInterface.removeColumn("coursesEnrolleds", "courseId");
  }
};
