'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("pageCompletions", "courseId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("pageCompletions", {
      fields: ["courseId"],
      type: "foreign key",
      name: "pageCompletion-course-fkey",
      references: {
        table: "coursesCreateds",
        field: "id",
      },
      // onDelete: 'cascade',daveMern

      // onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("pageCompletions", "courseId");
  }
};
