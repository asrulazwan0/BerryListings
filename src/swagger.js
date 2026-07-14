import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const createDefinition = (port) => {
    const url = `http://localhost:${port}`;
    return {
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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    };
};

export const createSwaggerSpec = (port) =>
    swaggerJsdoc({
        definition: createDefinition(port),
        apis: ['./src/routes/v1/*.js'],
    });

function swaggerDocs(app, port) {
    const swaggerPath = '/docs';
    const specs = createSwaggerSpec(port);

    app.use(swaggerPath, swaggerUi.serve, swaggerUi.setup(specs));
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });

    // open(url + swaggerPath);
}

export default swaggerDocs;
