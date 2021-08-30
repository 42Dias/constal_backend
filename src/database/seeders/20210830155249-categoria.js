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
    createdById: 'a54019c5-16bd-4321-9c49-643d83c2b811',
    updatedById: 'a54019c5-16bd-4321-9c49-643d83c2b811',
  }
))
 
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categoria', categoria, {});
  },
 
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Categoria', null, {});
  }
};
