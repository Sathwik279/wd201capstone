'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("pages", "chapterId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("pages", {
      fields: ["chapterId"],
      type: "foreign key",
      name: "chapter_page_fk",
      references: {
        table: "chapters",
        field: "id",
      },
      onDelete: 'CASCADE', // Enable cascading deletes
      onUpdate: 'CASCADE', // Enable cascading updates (optional)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("pages", "chapter_page_fk"); // Remove the constraint first
    await queryInterface.removeColumn("pages", "chapterId"); // Then remove the column
  }
};
