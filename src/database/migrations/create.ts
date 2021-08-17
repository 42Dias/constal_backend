/**
 * This script is responsible for create the SQL tables.
 * Run it via `npm run db:create`.
 */
require('dotenv').config();

import models from '../models';

models()
  .sequelize.sync()
  .then(() => {
    console.log('OK');
    process.exit();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
