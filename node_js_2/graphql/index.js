const fs = require("fs");
const path = require("path");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const { mergeResolvers } = require("@graphql-tools/merge");
const { makeExecutableSchema } = require("@graphql-tools/schema");

// Type definitions: schema
const newTypeDefs = fs.readFileSync(
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

//Resolvers
const newsResolvers = require("./resolvers/news");
const activitiesResolvers = require("./resolvers/activities");
const usersResolvers = require("./resolvers/users");

const schema = makeExecutableSchema({
  typeDefs: [sharedTypeDefs, newTypeDefs, activityTypeDefs, userTypeDefs],
  resolvers: mergeResolvers([newsResolvers, activitiesResolvers, usersResolvers]),
});

module.exports = { schema };
