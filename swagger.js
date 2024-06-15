import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Listings API',
      version: '1.0.0',
      description: 'API documentation for property listings',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Your server URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Specify the path to your route files
};

const specs = swaggerJsdoc(options);
function swaggerDocs(app, port) 
{
    // Swagger Page
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
    // Documentation in JSON format
    app.get('/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(specs)
    })
}

export default swaggerDocs
