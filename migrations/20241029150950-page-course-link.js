'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  
    await queryInterface.addColumn("pages", "courseId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("pages", {
      fields: ["courseId"],
      type: "foreign key",
      name: "page-course-fkey",
      references: {
        table: "coursesCreateds",
        field: "id",
      },
       onDelete: 'cascade',

       onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
   
    await queryInterface.removeColumn("pages", "courseId");
  }
};
