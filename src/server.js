import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import usersRouter from "./api/users/index.js";
import postsRouter from "./api/posts/index.js";
import experiencesRouter from "./api/posts/index.js";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT;

server.use(cors());
server.use(express.json());

// endpoints
server.use("/experiences", experiencesRouter);
server.use("/posts", postsRouter);
server.use("/users", usersRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
