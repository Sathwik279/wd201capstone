'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
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
       onDelete: 'cascade',

       onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
   
    await queryInterface.removeColumn("pageCompletions", "courseId");
  }
};
