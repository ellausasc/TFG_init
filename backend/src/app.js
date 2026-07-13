const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cookieParser = require("cookie-parser");

const jwt = require('jsonwebtoken');
const prisma = require("./config/db");
const { schema } = require("./graphql");
const minioRouter = require("./config/minio");
const permissions = require("./graphql/permissions/shield");
const { applyMiddleware } = require("graphql-middleware");
const JWT_SECRET = process.env.JWT_SECRET || 'XX';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();

  app.use(cors({ credentials: true, origin: 'http://localhost:4321' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const schemaWithMiddleware = applyMiddleware(schema, permissions);

  app.use(minioRouter);

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    introspection: true
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        // Busquem el token a la galeta 'token'
        const token = req.cookies?.token;

        let userId = null;
        let userPermissions = [];

        if (token) {
          try {
            // Decodifiquem i validem el token
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
            userPermissions = decoded.userPermissions || [];
            // Injectem l'userId i els permisos al context perque els llegeixin
            // les regles de graphql-shield i el resolver `me`
          } catch (err) {
            console.warn("Error de validacio del JWT:", err.message);
          }
        }

        return {
          req,
          res,
          userId,
          permissions: userPermissions
        };
      },
    }),
  );

  app.listen(4000, () => {
    console.log("Servidor en marxa a: http://localhost:4000/graphql");
  });
}

startServer().catch((err) => {
  console.error("Error en arrencar el servidor:", err);
});
