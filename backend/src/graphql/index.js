const fs = require("fs");
const path = require("path");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { mergeResolvers } = require("@graphql-tools/merge");
const { makeExecutableSchema } = require("@graphql-tools/schema");

// Definicions de tipus: esquema
const newsTypeDefs = fs.readFileSync(
  path.join(__dirname, "./schema/news.graphql"),
  "utf-8",
);
const activityTypeDefs = fs.readFileSync(
  path.join(__dirname, "./schema/activities.graphql"),
  "utf-8",
);
const sharedTypeDefs = fs.readFileSync(
  path.join(__dirname, "./schema/shared.graphql"),
  "utf-8",
);
const userTypeDefs = fs.readFileSync(
  path.join(__dirname, "./schema/users.graphql"),
  "utf-8",
);
const sectionTypeDefs = fs.readFileSync(
  path.join(__dirname, "./schema/sections.graphql"),
  "utf-8",
);
const roleTypeDefs = fs.readFileSync(
  path.join(__dirname, "./schema/roles.graphql"),
  "utf-8",
);

// Resolvers
const newsResolvers = require("./resolvers/newsResolver");
const activitiesResolvers = require("./resolvers/activitiesResolver");
const usersResolvers = require("./resolvers/usersResolver");
const sectionsResolvers = require("./resolvers/sectionsResolver");
const rolesResolvers = require("./resolvers/rolesResolver");

const schema = makeExecutableSchema({
  typeDefs: [sharedTypeDefs, newsTypeDefs, activityTypeDefs, userTypeDefs, sectionTypeDefs, roleTypeDefs],
  resolvers: mergeResolvers([newsResolvers, activitiesResolvers, usersResolvers, sectionsResolvers, rolesResolvers]),
});

module.exports = { schema };
