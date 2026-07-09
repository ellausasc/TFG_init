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
const permission = require("./graphql/permissions/shield");
// const { use } = require("react");
const { applyMiddleware } = require("graphql-middleware");
const JWT_SECRET = process.env.JWT_SECRET || 'XX';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();

  app.use(cors({credentials: true, origin: 'http://localhost:4321'}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const schemaWithMiddleware = applyMiddleware(schema, permission);

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
        // 1. Buscamos el token en la cabecera 'Authorization'
        const token = req.cookies?.token;

        let userId = null;
        let roles = [];

        if (token) {
          try {
            // 2. Decodificamos y validamos el token
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
            roles = decoded.userPermissions || [];
            // 3. Inyectamos el userId en el context para que lo lea la query `me`
          } catch (err) {
            console.warn("Error JWT:", err.message);
          }
        }

        return {
          req,
          res,
          userId,
          roles
        };
      },
    }),
  );

  app.listen(4000, () => {
    console.log("Servidor en: http://localhost:4000/graphql");
  });
}

startServer().catch((err) => {
  console.error("Error al arrancar el servidor:", err);
});
