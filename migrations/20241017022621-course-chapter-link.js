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
      // onDelete: 'cascade',daveMern

      // onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("chapters", "courseId");

  }
};
