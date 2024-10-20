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
      // onDelete: 'cascade',daveMern

      // onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("pages", "chapterId");
  }
};
