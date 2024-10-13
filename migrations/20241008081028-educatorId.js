"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("coursesCreateds", "educatorId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addConstraint("coursesCreateds", { //here we wil give the name of the actual table not the model name
      fields: ["educatorId"],
      type: "foreign key",
      name: "users_educatorId_fk",
      references: {
        table: "Users",
        field: "id",
      },
      // onDelete: 'cascade',
      // onUpdate: 'cascade'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("coursesCreateds", "educatorId");
  },
};
