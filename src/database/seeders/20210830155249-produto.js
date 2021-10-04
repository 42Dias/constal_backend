'use strict';
 
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

faker.locale = "pt_BR";
 
const produto = [...Array(50)].map((produto) => (
  {
    id: uuidv4(),
    nome: faker.commerce.productName(),
    descricao: faker.commerce.productDescription(),
    marca: faker.vehicle.manufacturer(),
    modelo: faker.vehicle.model(),
    caracteristicas: faker.commerce.productAdjective(),
    codigo: faker.datatype.number(),
    preco: faker.commerce.price(),
    somatoriaAvaliacoes: faker.datatype.number(),
    quantidadeAvaliacoes: faker.datatype.number(),
    volumeVendas: faker.datatype.number(),
    createdAt: new Date(),
    updatedAt: new Date(),
    empresaId: null,
    categoriaId: null,
    tenantId: 'fa22705e-cf27-41d0-bebf-9a6ab52948c4',
    createdById: 'a54019c5-16bd-4321-9c49-643d83c2b811',
    updatedById: 'a54019c5-16bd-4321-9c49-643d83c2b811',
  }
))
 
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Produtos', produto, {});
  },
 
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Produtos', null, {});
  }
};
