const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const jwt = require('jsonwebtoken');

const prisma = require("./db");

const { schema } = require("./graphql");

const JWT_SECRET = process.env.JWT_SECRET || 'XX';

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const server = new ApolloServer({
    schema,
    introspection: true
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // 1. Buscamos el token en la cabecera 'Authorization'
        const authHeader = req.headers.authorization || "";

        const token = authHeader.replace("Bearer ", "").trim();

        if (token) {
          try {
            // 2. Decodificamos y validamos el token
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Inyectamos el userId en el context para que lo lea la query `me`
            return { userId: decoded.userId };
          } catch (err) {
            console.warn("Error JWT:", err.message);
          }
        }

        // Si no hay token, o falló la verificación, devolvemos un contexto vacío
        return {};
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
