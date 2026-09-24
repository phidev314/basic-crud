import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fullstack E-Commerce API",
      version: "1.0.0",
      description: "API Documentation for Fullstack E-Commerce System",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local Server",
      },
      {
        url: "https://basic-crud-backend-fawn.vercel.app",
        description: "Production Server",
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.js")],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
    customCss:
      '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js",
    ],
  }));
};
