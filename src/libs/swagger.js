// docs/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import config from "../config/config.js";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API de Plataforma QA",
        version: "1.0.0",
        description:
            "Documentación de Endpoints y Modelos del Backend para la Gestion de las Pruebas en LSV-TECH",
    },
    servers: [
        {
            url: `http://localhost:${config.port}/api`,
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["./src/routes/*.js", "./src/models/*.js"], // ajusta estas rutas a donde tienes tus rutas y modelos
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
