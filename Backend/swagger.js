const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aestheticommerce API',
      version: '1.0.0',
      description: 'Backend API documentation for Aestheticommerce',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, 'docs/**/*.js'),
    path.join(__dirname, 'routes/**/*.js'),
    path.join(__dirname, 'routes-seller-panel/**/*.js'),
    path.join(__dirname, 'routes-delivery-panel/**/*.js'),
    path.join(__dirname, 'routes-admin-panel/**/*.js'),
  ],
};

module.exports = swaggerJsdoc(options);
