'use strict';
 
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

faker.locale = "pt_BR";
 
const empresa = [...Array(4)].map((empresa) => (
  {
    id: uuidv4(),
    marca: faker.vehicle.manufacturer(),
    razaoSocial: faker.company.companyName(),
    cnpj: faker.datatype.number({min: 10000000000000, max: 99999999999999}),
    telefone: faker.phone.phoneNumber(),
    ramal: faker.datatype.number({min: 1, max: 99}),
    email: faker.internet.email(),
    website: faker.internet.url(),
    cep: faker.address.zipCode(),
    logradouro: faker.address.streetName(),
    numero: faker.datatype.number({min: 1, max: 9999}),
    complemento: faker.address.streetSuffix(),
    pontoReferencia: faker.company.companyName(),
    cidade: faker.address.cityName(),
    estado: faker.address.state(),
    bairro: faker.address.county(),
    pix: faker.datatype.string(),
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: 'fa22705e-cf27-41d0-bebf-9a6ab52948c4',
    createdById: '41bbd975-cbf4-4e8d-9ed3-061c87c5c0f3',
    updatedById: '41bbd975-cbf4-4e8d-9ed3-061c87c5c0f3',
  }
))
 
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('empresas', empresa, {});
  },
 
  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('empresas', null, {});
  }
};
