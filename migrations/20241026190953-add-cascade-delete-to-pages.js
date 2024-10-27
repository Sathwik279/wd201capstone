'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the existing constraint
    await queryInterface.removeConstraint('pages', 'chapter_page_fk'); // Adjust constraint name if different

    // Add the new constraint with cascading delete
    await queryInterface.addConstraint('pages', {
      fields: ['chapterId'],
      type: 'foreign key',
      name: 'chapter_page_fk', // Use the same name as before or a new name
      references: {
        table: 'chapters',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes if needed
    await queryInterface.removeConstraint('pages', 'chapter_page_fk');
    await queryInterface.addConstraint('pages', {
      fields: ['chapterId'],
      type: 'foreign key',
      name: 'chapter_page_fk', // Original constraint name
      references: {
        table: 'chapters',
        field: 'id'
      },
      onDelete: 'NO ACTION', // Original behavior
      onUpdate: 'CASCADE'
    });
  }
};
