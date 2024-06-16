import open from 'open';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

function swaggerDocs(app, port) 
{
  const url = `http://localhost:${port}`;
  const swaggerPath = '/docs';
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
          url: url,
        },
      ],
    },
    apis: ['./routes/v1/*.js'],
  };
  const specs = swaggerJsdoc(options);

  app.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(specs))
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
  })

  open(url + swaggerPath);
}

export default swaggerDocs
