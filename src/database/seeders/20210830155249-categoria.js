'use strict';
 
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

faker.locale = "pt_BR";
 
const categoria = [...Array(15)].map((categoria) => (
  {
    id: uuidv4(),
    nome: faker.commerce.department(),
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 'fa22705e-cf27-41d0-bebf-9a6ab52948c4',
    createdById: '41bbd975-cbf4-4e8d-9ed3-061c87c5c0f3',
    updatedById: '41bbd975-cbf4-4e8d-9ed3-061c87c5c0f3',
  }
))
 
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('categoria', categoria, {});
  },
 
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('categoria', null, {});
  }
};
