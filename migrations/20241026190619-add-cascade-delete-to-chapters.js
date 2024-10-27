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
    await queryInterface.removeConstraint('chapters', 'course_chapter_fk');
    // Then, add the new constraint with cascading delete
      await queryInterface.addConstraint('chapters', {
        fields: ['courseId'],
        type: 'foreign key',
        name: 'course_chapter_fk',
        references: {
          table: 'coursesCreateds',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('chapters', 'course_chapter_fk');
    await queryInterface.addConstraint('chapters', {
      fields: ['courseId'],
      type: 'foreign key',
      name: 'course_chapter_fk',
      references: {
        table: 'coursesCreateds',
        field: 'id'
      },
      onDelete: 'NO ACTION', // Or the original behavior
      onUpdate: 'CASCADE'
    });
  }
};
