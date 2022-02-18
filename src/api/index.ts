import express from 'express';
import cors from 'cors';
import { authMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { databaseMiddleware } from '../middlewares/databaseMiddleware';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { createRateLimiter } from './apiRateLimiter';
import { languageMiddleware } from '../middlewares/languageMiddleware';
import authSocial from './auth/authSocial';
import setupSwaggerUI from './apiDocumentation';
import { getEmpresaMiddleware } from '../middlewares/getEmpresaMiddleware';
import path from 'path';

const app = express();

// Enables CORS
app.use(cors({ origin: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Authorization");
  app.use(cors());
  next();
});

// Initializes and adds the database middleware.
app.use(databaseMiddleware);

// Sets the current language of the request
app.use(languageMiddleware);

// Configures the authentication middleware
// to set the currentUser to the requests
app.use(authMiddleware);

// Middleware para encontrar o ususario empresa
app.use('/api/tenant/:tenantId/produto', getEmpresaMiddleware);

// Middleware para encontrar o ususario empresa
app.use('/api/tenant/:tenantId/pedido', getEmpresaMiddleware);
// app.use('/api/tenant/:tenantId/pedido', getPessoaFisicaMiddleware);

// Setup the Documentation
setupSwaggerUI(app);

// Default rate limiter
const defaultRateLimiter = createRateLimiter({
  max: 500,
  windowMs: 15 * 60 * 1000,
  message: 'errors.429',
});
app.use(defaultRateLimiter);

// Enables Helmet, a set of tools to
// increase security.
app.use(helmet());

// Parses the body of POST/PUT request
// to JSON
app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      const url = (<any>req).originalUrl;
      if (url.startsWith('/api/plan/stripe/webhook')) {
        // Stripe Webhook needs the body raw in order
        // to validate the request
        (<any>req).rawBody = buf.toString();
      }
    },
  }),
);

// Configure the Entity routes
const routes = express.Router();

// Enable Passport for Social Sign-in
authSocial(app, routes);

require('./auditLog').default(routes);
require('./auth').default(routes);
require('./plan').default(routes);
require('./tenant').default(routes);
require('./file').default(routes);
require('./user').default(routes);
require('./settings').default(routes);
require('./pessoaFisica').default(routes);
require('./empresa').default(routes);
require('./cartao').default(routes);
require('./produto').default(routes);
require('./pedido').default(routes);
require('./carrinho').default(routes);
require('./categoria').default(routes);
require('./carrinhoProduto').default(routes);
require('./pedidoProduto').default(routes);
require('./smtp').default(routes);
require('./comentario').default(routes);
require('./banner').default(routes);
require('./termo').default(routes);
require('./informacoes').default(routes);


// Loads the Tenant if the :tenantId param is passed
routes.param('tenantId', tenantMiddleware);

// Add the routes to the /api endpoint
app.use('/api', routes);

let https = require('https');
// let https = require('http');
// let https = require('http');
const fs = require('fs');

let sslServer;


  sslServer = https.createServer({
    ca:   fs.readFileSync(path.join(__dirname, '../../cert', 'constalshop.crt'),   'utf8'),
    key:  fs.readFileSync(path.join(__dirname, '../../cert', 'constalshop.key'),       'ascii'),
    cert: fs.readFileSync(path.join(__dirname, '../../cert', 'constalshop.pem'),   'utf8')
  }, app)


export default sslServer;
