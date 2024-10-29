'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("chapters", "courseId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("chapters", {
      fields: ["courseId"],
      type: "foreign key",
      name: "course_chapter_fk",
      references: {
        table: "coursesCreateds",
        field: "id",
      },
      onDelete: 'CASCADE', // Enable cascading deletes
      onUpdate: 'CASCADE', // Enable cascading updates (optional)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("chapters", "course_chapter_fk"); // Remove the constraint first
    await queryInterface.removeColumn("chapters", "courseId"); // Then remove the column
  }
};
